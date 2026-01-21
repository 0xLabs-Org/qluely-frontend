import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

type FaqType = { className?: string };
export function FAQ({ className }: FaqType) {
  return (
    <section
      id="faq"
      className={cn(
        'w-full max-w-7xl mx-auto my-auto flex flex-col justify-start items-center rounded-xl mb-10 overflow-hidden',
        className,
      )}
    >
      <div className="w-full max-w-4xl mx-auto text-center py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 my-4 sm:my-6 lg:my-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black mb-3 sm:mb-4 wrap-break-words">
          Frequently asked questions
        </h2>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black/60 wrap-break-words">
          These are the most commonly asked questions about Qluely.
        </p>
      </div>
      <Accordion
        type="single"
        collapsible
        className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 overflow-hidden"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1" className="overflow-hidden">
          <AccordionTrigger className="text-base sm:text-lg md:text-xl lg:text-2xl text-left wrap-break-words hyphens-auto pr-4">
            Is Qluely really undetectable?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-balance overflow-hidden">
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              Yes. Qluely runs locally on your device and does not inject bots, overlays, or plugins
              into your meetings. Nothing appears inside Zoom, Teams, or Google Meet. Other
              participants cannot detect Qluely.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="overflow-hidden">
          <AccordionTrigger className="text-base sm:text-lg md:text-xl lg:text-2xl text-left wrap-break-words hyphens-auto pr-4">
            Does Qluely record my meetings?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-balance overflow-hidden">
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              Only when you choose to. All processing happens privately on your device. Your data is
              never shared with meeting participants or third parties.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="overflow-hidden">
          <AccordionTrigger className="text-base sm:text-lg md:text-xl lg:text-2xl text-left wrap-break-words hyphens-auto pr-4">
            What does meeting credits mean?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-balance overflow-hidden">
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              A meeting credit represents one meeting session.
            </p>
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              1 credit = 1 hour session
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4" className="overflow-hidden">
          <AccordionTrigger className="text-base sm:text-lg md:text-xl lg:text-2xl text-left wrap-break-words hyphens-auto pr-4">
            Can I use Qluely for interviews?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-balance overflow-hidden">
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              Yes. Qluely is widely used for job interviews, sales calls, and client meetings.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5" className="overflow-hidden">
          <AccordionTrigger className="text-base sm:text-lg md:text-xl lg:text-2xl text-left wrap-break-words hyphens-auto pr-4">
            Can I upload files and images?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-balance overflow-hidden">
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              Yes. You can share images and reference documents to get smarter real-time answers.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6" className="overflow-hidden">
          <AccordionTrigger className="text-base sm:text-lg md:text-xl lg:text-2xl text-left wrap-break-words hyphens-auto pr-4">
            Does Qluely support long meetings?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 sm:gap-3 lg:gap-4 text-balance overflow-hidden">
            <p className="text-sm sm:text-base lg:text-lg wrap-break-words hyphens-auto leading-relaxed">
              Yes. Pro and Unlimited plans support extended meeting durations.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
