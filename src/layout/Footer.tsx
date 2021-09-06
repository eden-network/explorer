import Image from 'next/image';
import Link from 'next/link';

import logo from '../../public/logo.svg';

export default function Footer() {
  return (
    <footer className="bg-blue" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/">
              <a>
                <Image src={logo} width={103} alt={logo} />
              </a>
            </Link>
            <p className="text-gray-400 text-base">
              Eden Network is backed by some of the most trusted crypto projects
              and largest Block Producers in the world.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://medium.com/EdenNetwork"
                className="text-white hover:text-green"
              >
                <span className="sr-only">medium</span>
                <svg
                  className="h-6"
                  fill="currentColor"
                  aria-hidden="true"
                  viewBox="0 0 1076.63 1076.6"
                >
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <path
                        className="cls-1"
                        d="M1076.63,538.3C1076.63,241.2,835.42,0,538.33,0h0C241.2,0,0,241.2,0,538.3s241.2,538.3,538.3,538.3h0C835.42,1076.6,1076.63,835.39,1076.63,538.3Zm-484.27,0c0,132.33-106.54,239.6-238,239.6s-238-107.3-238-239.6S223,298.7,354.4,298.7,592.36,406,592.36,538.3Zm261,0c0,124.56-53.27,225.57-119,225.57s-119-101-119-225.57,53.26-225.56,119-225.56,119,101,119,225.56Zm106.78,0c0,111.57-18.74,202.07-41.85,202.07S876.5,649.9,876.5,538.3s18.73-202.07,41.84-202.07S960.19,426.7,960.19,538.3Z"
                      />
                    </g>
                  </g>
                </svg>
              </a>
              <a
                href="https://github.com/eden-network"
                className="text-white hover:text-green"
              >
                <span className="sr-only">github</span>
                <svg
                  className="h-6"
                  fill="currentColor"
                  aria-hidden="true"
                  viewBox="0 0 512 512"
                >
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <path
                        className="cls-1"
                        d="M296.13,354.17c49.89-5.89,103-24,103-110.19,0-24.49-8.63-44.45-22.68-59.87,2.27-5.89,9.52-28.11-2.73-58.94,0,0-18.14-5.9-60.76,22.67-18.14-5-38.09-8.17-56.68-8.17a214.06,214.06,0,0,0-56.7,8.17c-43.08-28.57-61.22-22.67-61.22-22.67-12.24,30.83-5,53.05-2.72,58.94-14.06,15.42-22.67,35.38-22.67,59.87,0,86.17,53.05,104.3,102.94,110.19-6.34,5.46-12.24,15.88-14.51,30.39-12.7,5.44-45.81,15.87-65.76-18.59,0,0-11.79-21.31-34-22.67,0,0-22.22-.45-1.81,13.59,0,0,15,6.81,24.94,32.65,0,0,13.6,43.09,76.18,29.48v38.55c0,5.9-4.53,12.7-15.86,10.89C96.14,439,32.2,354.63,32.2,255.77c0-123.81,100.22-224,224-224,123.35,0,224,100.21,223.57,224,0,98.86-63.95,182.75-152.83,212.69-11.34,2.26-15.87-4.53-15.87-10.89V395.45c0-20.87-6.81-34.47-15-41.28ZM512,256.23C512,114.73,397.26,0,256.23,0,114.73,0,0,114.73,0,256.23,0,397.26,114.73,512,256.23,512,397.26,512,512,397.26,512,256.23Z"
                      />
                    </g>
                  </g>
                </svg>
              </a>
              <a
                href="https://discord.io/edennetwork"
                className="text-white hover:text-green"
              >
                <span className="sr-only">discord</span>
                <svg
                  className="h-6"
                  fill="currentColor"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
              <a
                href="https://t.me/Eden_Network"
                className="text-white hover:text-green"
              >
                <span className="sr-only">telegram</span>
                <svg
                  className="h-6 py-0.5"
                  fill="currentColor"
                  aria-hidden="true"
                  viewBox="0 0 315.84 264.92"
                >
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <path
                        className="cls-1"
                        d="M168.22,207.61c-12.11,11.79-24.11,23.39-36,35.08-4.16,4.1-8.83,6.36-14.8,6.05-4.07-.22-6.35-2-7.6-5.87-9.11-28.28-18.36-56.49-27.42-84.79a6.6,6.6,0,0,0-5-4.94q-32.2-9.84-64.28-20.06a36.41,36.41,0,0,1-9.45-4.36c-4.4-3-5-7.83-1.1-11.32a43.61,43.61,0,0,1,12.5-7.82c26.24-10.4,52.62-20.46,79-30.61Q194.3,40.25,294.57,1.58c12.71-4.91,22.47,2,21.15,15.75-.84,8.79-3.12,17.44-5,26.12Q289,146.23,267.13,249c-3.46,16.27-14.89,20.51-28.27,10.64Q205.22,234.87,171.63,210C170.56,209.22,169.45,208.47,168.22,207.61Zm-50.33,20.81.76-.2a17.12,17.12,0,0,0,.4-1.91c1.44-15.53,3-31.06,4.21-46.62a11.42,11.42,0,0,1,4.07-8.26q31-27.72,61.8-55.64Q223.3,85,257.41,54.08c1.4-1.27,2-3.44,2.95-5.2-2.13-.23-4.43-1.09-6.37-.59A28.17,28.17,0,0,0,246.47,52Q171.05,99.52,95.62,147c-2.85,1.79-3.38,3.3-2.29,6.43,3.71,10.65,7.08,21.4,10.58,32.14Z"
                      />
                    </g>
                  </g>
                </svg>
              </a>
              <a
                href="https://twitter.com/edennetwork"
                className="text-white hover:text-green"
              >
                <span className="sr-only">twitter</span>
                <svg
                  className="h-6 py-0.5"
                  fill="currentColor"
                  aria-hidden="true"
                  viewBox="0 0 333.63 271.28"
                >
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                      <path
                        className="cls-1"
                        d="M104.68,271.28c126,0,194.86-104.4,194.86-194.87,0-3,0-6-.14-8.81a140.24,140.24,0,0,0,34.23-35.5,138.85,138.85,0,0,1-39.35,10.79A68.39,68.39,0,0,0,324.39,5a138.71,138.71,0,0,1-43.46,16.62A68.52,68.52,0,0,0,162.48,68.46a62.69,62.69,0,0,0,1.85,15.62A194.28,194.28,0,0,1,23.15,12.5a68.45,68.45,0,0,0,21.31,91.32,67.25,67.25,0,0,1-31-8.52v.85a68.56,68.56,0,0,0,55,67.18,68.38,68.38,0,0,1-18,2.42,65.52,65.52,0,0,1-12.92-1.28,68.38,68.38,0,0,0,63.91,47.58,137.7,137.7,0,0,1-85.08,29.26,124.53,124.53,0,0,1-16.33-1,190.82,190.82,0,0,0,104.68,31Z"
                      />
                    </g>
                  </g>
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 xl:mt-0 xl:col-span-2 xl:ml-32">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">
                  Interal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/">
                      <a className="text-white hover:text-green">Home</a>
                    </Link>
                  </li>

                  <li>
                    <Link href="/blocks">
                      <a className="text-white hover:text-green">Blocks</a>
                    </Link>
                  </li>

                  <li>
                    <Link href="/stakers">
                      <a className="text-white hover:text-green">Stakers</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  External
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a
                      className="text-white hover:text-green"
                      href="https://edennetwork.io/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Eden Network
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-white hover:text-green"
                      href="https://docs.edennetwork.io"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Docs
                    </a>
                  </li>
                  <li>
                    <a className="text-white hover:text-green" href="/faq">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-300 xl:text-center">
            &copy; 2021 Eden Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
