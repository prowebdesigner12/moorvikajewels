import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    MessageCircle,
    ClipboardList,
    Folder,
    TicketPercent,
    Star,
    Ghost,
    Layers,
    Gift,
    ChevronLeft,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminLogout } = useAuth();
    const { setTheme } = useTheme();

    // State for Collapsible Sidebar
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Enforce light theme for Admin Panel
    useEffect(() => {
        setTheme("light");
    }, []);

    const sidebarLinks = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
        { name: 'Inventory', path: '/admin/inventory', icon: ClipboardList },
        { name: 'Collections', path: '/admin/collections', icon: Folder },
        { name: 'Bundles', path: '/admin/bundles', icon: Layers },
        { name: 'Referrals', path: '/admin/referrals', icon: Gift },
        { name: 'Discounts', path: '/admin/discounts', icon: TicketPercent },
        { name: 'Abandoned', path: '/admin/abandoned', icon: Ghost },
        { name: 'WhatsApp Logs', path: '/admin/whatsapp-logs', icon: MessageCircle },
        { name: 'Inquiries', path: '/admin/inquiries', icon: MessageCircle },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r hidden md:flex flex-col shadow-sm transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Collapse/Expand Toggle Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute -right-4 top-5 h-8 w-8 rounded-full z-10 bg-white"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </Button>

                <div className={`h-16 flex items-center border-b ${isCollapsed ? 'justify-center' : 'px-6'}`}>
                    <div className={`h-8 w-8 rounded-lg bg-primary flex items-center justify-center ${isCollapsed ? '' : 'mr-3'}`}>
                        <span className="text-primary-foreground font-bold text-lg">S</span>
                    </div>
                    {!isCollapsed && <span className="text-xl font-bold text-primary">StoreAdmin</span>}
                </div>

                <nav className={`flex-1 overflow-y-auto py-4 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center rounded-lg text-sm font-medium transition-colors ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                                    } ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                title={isCollapsed ? link.name : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span>{link.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-4 border-t ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <Button
                        variant="ghost"
                        className={`text-red-500 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full justify-start'}`}
                        onClick={() => {
                            adminLogout();
                            navigate('/');
                        }}
                        title={isCollapsed ? "Logout Admin" : undefined}
                    >
                        <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-2'}`} />
                        {!isCollapsed && <span>Logout Admin</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
                    <div className="md:hidden flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="font-bold">StoreAdmin</span>
                    </div>
                    <div className="hidden md:block">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {sidebarLinks.find(l => location.pathname === l.path || (l.path !== '/admin' && location.pathname.startsWith(l.path)))?.name || 'Admin Area'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-gray-500">Super Admin</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-500" />
                        </div>
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
