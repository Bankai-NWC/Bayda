import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <section className="relative w-full h-[100vh] min-h-[400px]">
      <Image
        src="/images/hero-banner.jpg"
        alt="Banner"
        fill
        className="object-cover object-center md:object-[50%_30%]"
        priority
      />

      <div className="absolute inset-0 bg-black/40 flex items-center flex-col justify-end pb-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <h1 className="text-neutral-100 text-4xl font-thin">
            Elevate Your Style
            <br />
            Timeless Fashion, Sustainable
            <br />
            Choices
          </h1>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-600 rounded-none hover:bg-white/90 mt-6"
          >
            <Link href="/catalog">Shop Now</Link>
          </Button>
        </div>
      </div>
      <p className="text-white">Main page</p>
    </section>
  );
}
