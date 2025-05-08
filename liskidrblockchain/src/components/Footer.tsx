// filepath: c:\Users\mzida\Desktop\Coding_stuff\LiskIDRXHackathon\liskidrblockchain\src\components\Footer.tsx
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-neutral-200 dark:border-neutral-800 text-foreground body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <Link
          href="/"
          className="flex title-font font-medium items-center md:justify-start justify-center text-foreground"
        >
          <span className="ml-3 text-xl">LendApp</span>
        </Link>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-neutral-300 dark:sm:border-neutral-700 sm:py-2 sm:mt-0 mt-4">
          © 2025 LendApp —
          <a
            href="https://lisk.com/" // Replace with actual Lisk link or your project link
            className="text-neutral-700 dark:text-neutral-300 ml-1 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Powered by Lisk
          </a>
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start space-x-3">
          <a
            href="https://twitter.com/LiskHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <svg
              fill="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <title>Twitter</title>
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          {/* Add more social links as needed */}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
