import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type FaqType = { className?: string };
export function FAQ({ className }: FaqType) {
  return (
    <section
      id="faq"
      className={cn(
        "max-w-7xl mx-auto my-auto flex flex-col justify-start items-center rounded-xl mb-10",
        className,
      )}
    >
      <div className="w-4xl mx-auto text-center py-16 px-4 my-10">
        <h2 className="text-4xl sm:text-5xl font-semibold text-black mb-4">
          Frequently asked questions
        </h2>

        <p className="text-lg md:text-2xl text-black/60  ">
          These are the most commonly asked questions about Qluely.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-4xl mx-auto" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl">Is Qluely really undetectable?</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p className="text-lg">
              Yes. Qluely runs locally on your device and does not inject bots, overlays, or plugins
              into your meetings. Nothing appears inside Zoom, Teams, or Google Meet. Other
              participants cannot detect Qluely.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-2xl">Does Qluely record my meetings?</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p className="text-lg">
              Only when you choose to. All processing happens privately on your device. Your data is
              never shared with meeting participants or third parties.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-2xl">What does meeting credits mean?</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p className="text-lg">A meeting credit represents one meeting session.</p>
            <p className="text-lg">1 credit = 1 hour session</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-2xl">Can I use Qluely for interviews?</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p className="text-lg">
              Yes. Qluely is widely used for job interviews, sales calls, and client meetings.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-2xl">Can I upload files and images?</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p className="text-lg">
              Yes. You can share images and reference documents to get smarter real-time answers.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-2xl">
            Does Qluely support long meetings?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p className="text-lg">
              Yes. Pro and Unlimited plans support extended meeting durations.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
