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
          <div className="flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-indigo-800">
              <SpeakerphoneIcon
                className="h-6 w-6 text-blue"
                aria-hidden="true"
              />
            </span>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
