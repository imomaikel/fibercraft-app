import Staff from './components/Staff';
import Testimonials from './components/Testimonials';

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
