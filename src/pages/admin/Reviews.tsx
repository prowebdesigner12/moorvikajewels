import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, CheckCircle, XCircle, Star, Loader2, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CustomerDetailsModal from '@/components/admin/CustomerDetailsModal'; // We'll create this inline or use the existing modal pattern

const Reviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/reviews?admin=true');
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) {
                setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
                toast.success(`Review ${newStatus}`);
            } else {
                toast.error("Failed to update status");
            }
        } catch (e) {
            toast.error("Error updating review");
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/reviews?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== deleteId));
                toast.success("Review deleted");
                setDeleteId(null);
            } else {
                toast.error("Failed to delete review");
            }
        } catch (e) {
            toast.error("Error deleting review");
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[40%]">Comment</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No reviews found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell className="font-medium text-sm">
                                        {review.product_name || "Unknown Product"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <button
                                                className="text-blue-600 hover:underline font-medium flex items-center gap-1 text-left"
                                                onClick={() => review.customer_email && setSelectedEmail(review.customer_email)}
                                            >
                                                {review.customer_name}
                                                {review.is_verified === 1 && (
                                                    <ShieldCheck className="h-3 w-3 text-green-600" aria-label="Verified Buyer" />
                                                )}
                                            </button>
                                            <span className="text-xs text-muted-foreground">{review.customer_email || "No Email"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-rose-500">
                                            {review.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 truncate max-w-xs" title={review.comment}>
                                        {review.comment}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            review.status === 'approved' ? 'default' :
                                                review.status === 'rejected' ? 'destructive' : 'secondary'
                                        } className="capitalize">
                                            {review.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {review.status !== 'approved' && (
                                                <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 bg-green-50"
                                                    onClick={() => handleStatusUpdate(review.id, 'approved')} title="Approve">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <Button size="icon" variant="ghost" className="text-amber-600 hover:text-amber-700 bg-amber-50"
                                                    onClick={() => handleStatusUpdate(review.id, 'rejected')} title="Reject">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 bg-red-50"
                                                onClick={() => setDeleteId(review.id)} title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Review?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This review will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CustomerDetailsModal
                email={selectedEmail}
                isOpen={!!selectedEmail}
                onClose={() => setSelectedEmail(null)}
            />
        </div>
    );
};

export default Reviews;
