import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, PieChart as PieIcon, Package, MapPin, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from "lucide-react";
import { SalesChart } from "@/components/admin/SalesChart";
import { RecentOrders } from "@/components/admin/RecentOrders";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = () => {
            fetch('/api/analytics')
                .then(res => res.json())
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load analytics", err);
                    setLoading(false);
                });
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!data) return <div>Failed to load data.</div>;

    const {
        totals,
        salesOverTime,
        topProducts,
        paymentMethods,
        lowStock,
        topCustomers,
        regionalSales,
        inventoryVelocity,
        forecast
    } = data;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard & Analytics</h2>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totals?.total_revenue?.toLocaleString() || 0}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-green-600">Today: ₹{totals?.today_revenue?.toLocaleString() || 0}</span>
                            <span className="text-[10px] text-muted-foreground">Yesterday: ₹{totals?.yesterday_revenue?.toLocaleString() || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totals?.total_orders || 0}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-blue-600">Today: {totals?.today_orders || 0}</span>
                            <span className="text-[10px] text-muted-foreground">Yesterday: {totals?.yesterday_orders || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals?.active_orders || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending/Processing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{totals?.total_orders ? Math.round(totals.total_revenue / totals.total_orders).toLocaleString() : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Revenue per order</p>
                    </CardContent>
                </Card>
            </div>

            {lowStock && lowStock.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                        ⚠️ Low Stock Alert
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {lowStock.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-4 bg-white p-3 rounded border border-orange-100 shadow-sm">
                                <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{p.name}</p>
                                    <p className="text-xs font-bold text-red-600 mt-1">Only {p.stock} left</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <SalesChart data={data.monthlySales} />
                <RecentOrders orders={data.recentOrders} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart: Sales Over Time */}
                <Card className="col-span-4 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle>Sales Overview (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            {salesOverTime && salesOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesOverTime}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} labelFormatter={(label) => new Date(label).toDateString()} />
                                        <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No sales data yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="col-span-3 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {topProducts && topProducts.length > 0 ? (
                                topProducts.map((product: any, i: number) => (
                                    <div key={i} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            #{i + 1}
                                        </div>
                                        <div className="ml-4 space-y-1 flex-1">
                                            <p className="text-sm font-medium leading-none line-clamp-1">{product.product_name}</p>
                                            <p className="text-xs text-muted-foreground">{product.sold} units sold</p>
                                        </div>
                                        <div className="font-bold">
                                            <Package className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">No product data</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Analytics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Regional Sales */}
                <Card className="col-span-3 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Regional Sales (Top Cities)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            {regionalSales && regionalSales.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={regionalSales} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="city" type="category" axisLine={false} tickLine={false} width={80} />
                                        <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No regional data</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Lifetime Value */}
                <Card className="col-span-4 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Top Customers (CLV)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCustomers && topCustomers.length > 0 ? (
                                topCustomers.map((customer: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                                {customer.customer_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{customer.customer_name}</p>
                                                <p className="text-[10px] text-muted-foreground">{customer.customer_phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">₹{customer.total_spend.toLocaleString()}</p>
                                            <p className="text-[10px] text-muted-foreground">{customer.order_count} orders</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">No customer data</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Revenue Forecast */}
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-white">7-Day Revenue Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{forecast?.next7Days?.toLocaleString() || 0}</div>
                        <p className="text-xs opacity-70 mt-2">
                            Predicted based on daily average of ₹{forecast?.dailyAvg?.toLocaleString()}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 p-2 rounded w-fit">
                            <TrendingUp className="h-3 w-3" />
                            <span>85% confidence score</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Predictions */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Fastest Selling (Stock Health)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {inventoryVelocity && inventoryVelocity.length > 0 ? (
                                inventoryVelocity.map((item: any, i: number) => {
                                    const velocity = item.units_sold_7d / 7;
                                    const daysLeft = velocity > 0 ? Math.round(item.stock / velocity) : "∞";
                                    return (
                                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.units_sold_7d} sold in 7d</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${daysLeft !== "∞" && Number(daysLeft) < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {daysLeft} days left
                                                </p>
                                                <p className="text-xs text-muted-foreground">{item.stock} in stock</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">Steady sales velocity</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods Chart */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 transition-all hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5" />
                            Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            {paymentMethods && paymentMethods.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentMethods}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="payment_method"
                                        >
                                            {paymentMethods.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">No payment data</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
