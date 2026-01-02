import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-200 bg-white text-black relative h-[50svh] md:h-[30svh]"
      id="footer"
    >
      <div className="max-w-5xl mx-auto flex flex-col justify-around items-center gap-8">
        <div className="w-full flex flex-col md:flex-row justify-between mx-auto">
          <div className="flex gap-2 items-center cursor-pointer">
            <Image src="/logo.png" width={50} height={50} alt="logo" />
            <span className="text-black font-bold text-4xl">Qluely</span>
          </div>
          <div className="flex flex-col gap-2 ">
            <span className="text-sm text-black/40 font-medium">Social</span>
            <span className="text-black/60 hover:text-black/90 cursor-pointer">
              Instagram
            </span>
            <span className="text-black/60 hover:text-black/90 cursor-pointer">
              Twitter
            </span>
          </div>
        </div>
        <span className="text-black/40 absolute bottom-5">
          &copy; 2026 Qluely. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
