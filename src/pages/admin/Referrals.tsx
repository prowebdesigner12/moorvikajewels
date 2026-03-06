import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Gift, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AdminReferrals = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ referrals: any[], stats: any }>({ referrals: [], stats: {} });
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/referrals')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredReferrals = data.referrals.filter(r =>
        r.referrer_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.referrer_phone?.includes(search) ||
        r.referee_phone?.includes(search)
    );

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Referral Program Kundli</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.total_referrals || 0}</div>
                        <p className="text-xs text-muted-foreground">Successful invites</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Points Distributed</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.total_points_distributed || 0}</div>
                        <p className="text-xs text-muted-foreground">Loyalty points awarded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Referrers</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.active_referrers || 0}</div>
                        <p className="text-xs text-muted-foreground">Users who invited at least 1 person</p>
                    </CardContent>
                </Card>
            </div>

            {/* List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Referral History</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Referrer (Giver)</TableHead>
                                <TableHead>Referee (Receiver)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReferrals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No referrals found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReferrals.map((referral) => (
                                    <TableRow key={referral.id}>
                                        <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{referral.referrer_name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{referral.referrer_phone}</div>
                                        </TableCell>
                                        <TableCell>{referral.referee_phone}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 capitalize">
                                                {referral.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{referral.order_id}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">+{referral.reward_points}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReferrals;
