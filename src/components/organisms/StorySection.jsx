import Eyebrow from '../atoms/Eyebrow';
import Reveal from '../atoms/Reveal';
import StoryBlock from '../molecules/StoryBlock';
import { useT } from '../../hooks/useT';

export default function StorySection() {
  const { t } = useT();
  const [heading1, heading2] = t.story.heading;

  return (
    <section id="story" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
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
          <StoryBlock isLast>{t.story.p2}</StoryBlock>
        </div>
      </div>
    </section>
  );
}
