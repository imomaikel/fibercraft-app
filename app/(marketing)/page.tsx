import Testimonials from './components/Testimonials';
import Staff from './components/Staff';

const MarketingPage = () => {
  return (
    <div className="flex flex-col">
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
