import React from 'react';

import { Meta } from '../layout/Meta';
import Shell from '../layout/Shell';

export default function ErrorPage({
  errorMsg,
  children,
}: {
  errorMsg: string;
  children?: React.ReactNode;
}) {
  return (
    <Shell meta={<Meta title="Error" description="Eden Network Explorer" />}>
      <div className="max-w-4xl mx-auto grid gap-5">
        <div className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-blue">
          <div className="flex-1 p-10 flex flex-col justify-between">
            <div className="flex-1 mt-4 text-center">{errorMsg}</div>
            {children}
          </div>
        </div>
      </div>
    </Shell>
  );
}
