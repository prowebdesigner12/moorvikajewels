import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, Search, Loader2, Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Collection {
    id: string;
    title: string;
    products: string[]; // IDs
    image?: string;
}

const Collections = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/collections');
            if (res.ok) {
                const data = await res.json();
                setCollections(data);
            }
        } catch (error) {
            console.error("Failed to load collections", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this collection?")) return;

        try {
            const res = await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCollections(collections.filter(c => c.id !== id));
                toast.success("Collection deleted");
            }
        } catch (error) {
            toast.error("Failed to delete collection");
        }
    };

    const filteredCollections = collections.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground">Group products into categories.</p>
                </div>
                <Button onClick={() => navigate('/admin/collections/new')} className="bg-gray-900 hover:bg-black text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create collection
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter collections..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]"></TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCollections.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No collections found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCollections.map((collection) => (
                                    <TableRow
                                        key={collection.id}
                                        className="cursor-pointer hover:bg-gray-50 bg-white"
                                        onClick={() => navigate(`/admin/collections/edit/${collection.id}`)}
                                    >
                                        <TableCell>
                                            <div className="h-10 w-10 rounded border overflow-hidden bg-gray-100 flex items-center justify-center">
                                                {collection.image ? (
                                                    <img src={collection.image} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">Img</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{collection.title}</TableCell>
                                        <TableCell>{collection.products?.length || 0} products</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={(e) => handleDelete(collection.id, e)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
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

export default Collections;
