import { useState } from "react";
import { useInquiries } from "@/context/InquiryContext";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Inquiry } from "@/context/InquiryContext";

const Inquiries = () => {
    const { inquiries, updateStatus } = useInquiries();

    // State for Admin Note Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [newStatus, setNewStatus] = useState<Inquiry['status'] | null>(null);
    const [adminNote, setAdminNote] = useState("");

    const sortedInquiries = Object.entries(inquiries)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleStatusChangeClick = (inquiry: Inquiry, status: Inquiry['status']) => {
        if (inquiry.status === status) return;

        setSelectedInquiry(inquiry);
        setNewStatus(status);
        setAdminNote(inquiry.adminNotes || "");
        setIsDialogOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        if (selectedInquiry && newStatus) {
            await updateStatus(selectedInquiry.id, newStatus, adminNote);
        }
        setIsDialogOpen(false);
        setSelectedInquiry(null);
        setNewStatus(null);
        setAdminNote("");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    {inquiries.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No inquiries yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Initial Interest</TableHead>
                                    <TableHead>Admin Note</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map((inquiry) => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell>
                                            {format(new Date(inquiry.date), "MMM d, yyyy h:mm a")}
                                        </TableCell>
                                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                                        <TableCell>{inquiry.mobile}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={inquiry.initialQuery}>
                                            {inquiry.initialQuery || "General Inquiry"}
                                        </TableCell>
                                        <TableCell className="max-w-xs text-xs truncate" title={inquiry.adminNotes}>
                                            {inquiry.adminNotes || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={inquiry.status}
                                                onValueChange={(val) => handleStatusChangeClick(inquiry, val as Inquiry['status'])}
                                            >
                                                <SelectTrigger className="w-[120px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="New">
                                                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">New</Badge>
                                                    </SelectItem>
                                                    <SelectItem value="Contacted">
                                                        <Badge variant="secondary" className="bg-rose-500 hover:bg-rose-600 text-white">Contacted</Badge>
                                                    </SelectItem>
                                                    <SelectItem value="Closed">
                                                        <Badge variant="outline" className="text-green-600 border-green-600">Closed</Badge>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Admin Note Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Ticket Status</DialogTitle>
                        <DialogDescription>
                            Changing status to <strong>{newStatus}</strong>. You can optionally add a note below which will be sent to the customer via WhatsApp along with the status update.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Resolution / Admin Note (Optional)</label>
                            <Textarea
                                placeholder="E.g. We tried calling you but couldn't reach you. We restocked the item you asked about."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmStatusChange}>Update & Send WhatsApp</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Inquiries;
