import Testimonials from './components/Testimonials';
import Discord from './components/Discord';
import Staff from './components/Staff';

const MarketingPage = () => {
  return (
    <div className="flex flex-col">
      <section>
        <Discord />
      </section>
      <section>
        <Testimonials />
      </section>
      <section>
        <Staff />
      </section>
    </div>
  );
};

export default MarketingPage;
