/* This example requires Tailwind CSS v2.0+ */
import { ReactNode } from 'react';

import { SpeakerphoneIcon } from '@heroicons/react/outline';

type IMainProps = {
  children?: ReactNode;
};

export default function Banner(props: IMainProps) {
  return (
    <div className="bg-green">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-indigo-800">
              <SpeakerphoneIcon
                className="h-6 w-6 text-blue"
                aria-hidden="true"
              />
            </span>
            <p className="ml-3 font-medium text-blue truncate">
              {props.children}
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto" />
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3" />
        </div>
      </div>
    </div>
  );
}
