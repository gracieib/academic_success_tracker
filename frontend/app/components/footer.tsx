import Image from 'next/image';

export default function Footer() {
    return (
      <footer className='flex-center flex-space-between p1'>
        <p>&copy;CGPA Planner by <span className="copyright">Grace</span></p>
        <ul className='flex-center gap1'>
          <li className='backToTop'><Image src='/images/icons/blackhole.svg' alt='' width={30} height={30}/></li>
        </ul>
      </footer>
    )
  }
  