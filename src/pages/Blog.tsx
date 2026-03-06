import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Blog = () => {
    const posts = [
        {
            id: 1,
            title: "Top 10 Fashion Trends for 2025",
            excerpt: "Discover the styles that will define the upcoming year in fashion.",
            category: "Fashion",
            date: "Jan 15, 2025"
        },
        {
            id: 2,
            title: "Choosing the Right Headphones",
            excerpt: "A comprehensive guide to finding the perfect audio gear for your needs.",
            category: "Tech",
            date: "Jan 10, 2025"
        },
        {
            id: 3,
            title: "Sustainable Shopping: A Guide",
            excerpt: "How to make eco-friendly choices without compromising on style.",
            category: "Lifestyle",
            date: "Jan 05, 2025"
        }
    ];

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">Latest From Our Blog</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-center mb-2">
                                <Badge variant="secondary">{post.category}</Badge>
                                <span className="text-sm text-muted-foreground">{post.date}</span>
                            </div>
                            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                            <CardDescription className="line-clamp-3 mt-2">
                                {post.excerpt}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">Read More</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Blog;
