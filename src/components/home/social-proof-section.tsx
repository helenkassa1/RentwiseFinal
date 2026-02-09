import { Card } from "@/components/ui/card";

export function SocialProofSection() {
  const testimonials = [
    {
      quote: "Finally, a tool that knows PG County's 2024 rent stabilization law",
      author: "Property Manager, 24 units",
    },
    {
      quote: "Caught 3 illegal clauses my attorney missed",
      author: "Landlord, DC",
    },
    {
      quote: "The voucher workflows saved me weeks of back-and-forth with DCHA",
      author: "Property Manager, 15 units",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="p-6">
            <p className="text-lg italic mb-2">&quot;{testimonial.quote}&quot;</p>
            <p className="text-sm text-muted-foreground">— {testimonial.author}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
