"use client";
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/app/components/logo';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react'; // If using NextAuth.js
// or your custom auth logic (e.g., Firebase, Supabase, etc.)

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('studentEmail'); // Clear student session
    router.push('/login'); // Redirect to login page
  };

  return (
    <aside id='sidebar' className='sidebar p2'>
      <ul className='flex-column gap2'>
        <li className='logoArea1'><Logo /></li>
        <li title='Overview'><Link href='/overview'><Image src='/images/icons/dashboard.svg' alt='' width={25} height={25} /> Overview</Link></li>
        <li title='Progress'><Link href='/progress'><Image src='/images/icons/progress.svg' alt='' width={25} height={25} /> CGPA Tracker</Link></li>
        <li title='Chatbot'><Link href='/chatbot'><Image src='/images/icons/chatbot.svg' alt='' width={25} height={25} /> AI bot</Link></li>
        <li title='TO-Do'><Link href='/Todo'><Image src='/images/icons/dietplan.svg' alt='' width={25} height={25} />To-Do</Link></li>
        <hr />
        <li title='Contact Us'><Link href='/contact'><Image src='/images/icons/contact.svg' alt='' width={25} height={25} /> Contact Us</Link></li>
        <li title='Help'><Link href='/help'><Image src='/images/icons/help.svg' alt='' width={25} height={25} /> Help</Link></li>
        <li title='My Profile'><Link href='/my-profile'><Image src='/images/icons/user.svg' alt='' width={25} height={25} /> My Account</Link></li>
        <hr />
        <li title='Logout'>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <Image src='/images/icons/logout.svg' alt='' width={25} height={25} />
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
}