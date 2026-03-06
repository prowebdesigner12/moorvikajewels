import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";

const FAQs = [
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unused items in their original packaging. Refunds are processed within 5-7 business days."
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to over 50 countries. Shipping rates and delivery times vary by location calculated at checkout."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order ships, you will receive a tracking link via email. You can also track it from your account dashboard."
    },
    {
        question: "Are your products authentic?",
        answer: "Absolutely. We source directly from authorized manufacturers and guarantee 100% authenticity on all products."
    },
    {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled within 1 hour of placement. After that, they enter our processing system and cannot be modified."
    }
];

const FAQ = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header onCartClick={() => { }} onSearch={() => { }} />

            <main className="flex-1 py-12 md:py-20">
                <div className="container px-4 max-w-3xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground">Everything you need to know about shopping with us.</p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {FAQs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left text-lg font-medium">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FAQ;
