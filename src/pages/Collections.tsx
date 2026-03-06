import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";

interface Collection {
    id: string;
    title: string;
    image?: string;
    description: string;
}

const Collections = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch('/api/collections');
                if (res.ok) {
                    const data = await res.json();
                    setCollections(data);
                }
            } catch (error) {
                console.error("Failed to load collections");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    if (isLoading) {
        return (
            <div className="container py-16 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 w-1/4 mx-auto rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-16">
            <h1 className="text-4xl font-bold text-center mb-12">Collections</h1>

            {collections.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No collections found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            to={`/collections/${collection.id}`}
                            className="group block"
                        >
                            <Card className="overflow-hidden border-none shadow-none group-hover:shadow-lg transition-shadow duration-300">
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                                    {collection.image ? (
                                        <img
                                            src={collection.image}
                                            alt={collection.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <CardContent className="pt-4 px-2 text-center">
                                    <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{collection.title}</h3>
                                    {collection.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{collection.description}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Collections;
