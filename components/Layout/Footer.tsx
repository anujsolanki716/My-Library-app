import React from 'react';
import { APP_NAME } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-gray-400 text-center p-4 mt-auto">
      <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      {/* <p className="text-xs mt-1">
        This is a demo application. Data is stored in localStorage and will be lost if browser data is cleared.
      </p> */}
    </footer>
  );
};

export default Footer;
