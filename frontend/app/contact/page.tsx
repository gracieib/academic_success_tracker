import Image from "next/image";
import styles from './contact.module.css';

export default function Contact() {
  return (
    <div className={`flex-center flex-column ${styles.contact}`}>
      <div className={`pt3 pb3 ${styles.heading}`}>
        <h1>We Value Your Feedback</h1>
      </div>
      
      <div className={`flex-center flex-column ${styles.contactFormContainer}`}>
        <form className={`flex-column gap2 ${styles.feedback}`} action="" method="post">
          {/* Email contact moved here */}
          <div className={`flex-center gap1 ${styles.contactInfo}`}>
            <Image src='/images/icons/mail.svg' alt="Email icon" width={40} height={40} />
            <div className={`flex-column ${styles.data}`}>
              <h2>Email Us</h2>
              <p>We are here to help</p>
              <span>contactacademicsuccess@gmail.com</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Message:</label>
            <textarea 
              className={`${styles.formTextarea} ${styles.largeTextarea}`} 
              name="message" 
              required
            ></textarea>
          </div>

          <button 
            className={`${styles.submitButton} ${styles.largeButton}`} 
            type="submit"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};