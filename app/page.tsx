import Image from "next/image";
import { Accordion, Card } from "@/components/ui";

const test = [
  { title: "섹션 1", content: "2233 1" },
  { title: "섹션 2", content: "내용 2" },
  { title: "섹션 3", content: "내용 3" },
];

const cardData = {
  title: "test Card",
  description: "sub",
  content: (
    <form>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">form test</div>
        <div className="grid gap-2">form test</div>
        <div className="grid gap-2">form test</div>
        <div className="grid gap-2">form test</div>
        <div className="grid gap-2">form test</div>
        <div className="grid gap-2">form test</div>

        <div
          key="asd"
          className="grid gap-2">
          form test
        </div>
      </div>
    </form>
  ),
  slots: {
    action: <p>asda</p>,
    footer: [<button key="ok">aasdas</button>, <button key="cancle">sadsds</button>],
  },
};

export default function Home() {
  return <div className="hidden flex-1 flex-col md:flex">asdasd</div>;
}
