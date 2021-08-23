import Image from 'next/image'
import logo from '../public/logo.svg'

const selectedButton = "bg-green-mid text-blue px-3 py-2 rounded-md text-sm font-medium";
const unselectedButton = "text-gray-300 hover:bg-green hover:text-blue px-3 py-2 rounded-md text-sm font-medium";

export default function Header({ selected }: { selected?: 'blocks' | 'stakers' }) {

  return (
    <nav className="bg-blue border-b border-green-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center px-2 lg:px-0">
            <div className="flex-shrink-0">
              <Image src={logo} width={103} />
            </div>
            <div className="hidden lg:block lg:ml-6">
              <div className="flex space-x-4">
                <a href="#" className={selected === 'blocks' ? selectedButton : unselectedButton}>Blocks</a>
                <a href="#" className={selected === 'stakers' ? selectedButton : unselectedButton}>Stakers</a>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6 lg:ml-6">
            <div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
              <div className="w-full">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input id="search" name="search" className="block w-full bg-blue-light border border-green-mid rounded-md py-2 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:text-white focus:placeholder-gray-400 focus:ring-1 focus:ring-green focus:border-green sm:text-sm" placeholder="Search by address, transaction, or block" type="search" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}