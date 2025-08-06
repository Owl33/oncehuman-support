import {
  Accordion as UiAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/base/accordion";
import { cn } from "@/lib/utils";

type AccordionItemData = {
  title: string;
  content: React.ReactNode;
  value?: string;
};

type AccordionProps = {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
  collapsible?: boolean;
};

export const Accordion = ({
  items,
  allowMultiple = false,
  className,
  collapsible = true,
}: AccordionProps) => {
  const accordionType = allowMultiple ? "multiple" : "single";

  return (
    <UiAccordion
      type={accordionType as "single" | "multiple"}
      collapsible={collapsible}
      className={cn("w-56", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.value ?? index}
          value={item.value ?? `item-${index}`}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </UiAccordion>
  );
};
