import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import StoryBlock from '../molecules/StoryBlock';
import { useT } from '../../hooks/useT';
import utencilios from '../../assets/images/utencilios.jpg';

export default function StorySection() {
  const { t } = useT();
  const [heading1, heading2] = t.story.heading;

  return (
    <section id="story" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal className="relative mx-auto max-w-xs lg:mx-0">
            <div className="absolute -inset-6 border border-espresso/10" />
            <img
              src={utencilios}
              alt="Handcrafted matcha preparation at Maybe Café"
              className="relative aspect-[.85/1] w-full object-cover"
              style={{ filter: 'saturate(.9) contrast(1.05)' }}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Eyebrow>{t.story.eyebrow}</Eyebrow>
            <h2 className="mt-6 font-display text-4xl uppercase sm:text-5xl">
              {heading1}
              <br />
              {heading2}
            </h2>
          </Reveal>
        </div>

        <div className="flex flex-col gap-32 pt-2 sm:gap-44">
          <StoryBlock>{t.story.p1}</StoryBlock>
          <StoryBlock>{t.story.p2}</StoryBlock>
          <StoryBlock isLast isSignature>
            {t.story.signature}
          </StoryBlock>
        </div>
      </div>
    </section>
  );
}
