import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare } from "lucide-react";

interface WhatsAppLog {
    id: string;
    customer_phone: string;
    message_type: string;
    status: string;
    created_at: string;
}

const WhatsAppLogs = () => {
    const [logs, setLogs] = useState<WhatsAppLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { adminUser } = useAuth();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/whatsapp-logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            } else {
                toast.error("Failed to fetch WhatsApp logs");
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("An error occurred while fetching logs");
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'otp': return 'bg-blue-100 text-blue-800';
            case 'order_confirmation': return 'bg-purple-100 text-purple-800';
            case 'order_update': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">WhatsApp Logs</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Message History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No WhatsApp messages have been sent yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Message Type</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {log.customer_phone}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getTypeColor(log.message_type)}>
                                                {log.message_type.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WhatsAppLogs;
