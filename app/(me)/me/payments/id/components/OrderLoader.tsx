'use client';
import { ClockLoader } from 'react-spinners';
import { MdError } from 'react-icons/md';

type TOrderLoader = {
  showDoesNotExist?: boolean;
  showProcessing?: boolean;
  showLoading?: boolean;
};
const OrderLoader = ({ showDoesNotExist = false, showLoading = false, showProcessing = false }: TOrderLoader) => {
  return (
    <div className="flex w-full justify-center">
      <div className="mt-12 flex flex-col items-center justify-center space-y-4 rounded-xl border px-12 py-6 md:flex-row md:space-x-6 md:space-y-0">
        <div>
          <h2 className="inline-block bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-center text-6xl font-extrabold text-transparent">
            {showDoesNotExist ? 'Hey!' : 'Please Wait'}
          </h2>
          {showProcessing && <p className="text-center text-muted-foreground">We are processing your order!</p>}
          {showLoading && <p className="text-center text-muted-foreground">We are checking your order!</p>}
          {showDoesNotExist && <p className="text-center text-muted-foreground">This order does not exist!</p>}
        </div>
        <div>
          {showDoesNotExist ? (
            <MdError className="h-[200px] w-[200px] text-primary" />
          ) : (
            <ClockLoader size={200} color="#3b82f6" />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderLoader;
