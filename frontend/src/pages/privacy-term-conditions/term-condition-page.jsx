import { useEffect } from "react";
import Typography from "@/components/ui/typography";
import logo from "../../assets/images/logo.svg";
import * as XLSX from "xlsx";

export default function TermConditions() {
  useEffect(() => {
    // ... XLSX logic unchanged ...
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex justify-center items-stretch px-2 py-6 md:py-12">
        <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-4 md:p-10 flex flex-col gap-6 overflow-y-auto max-h-[90vh] policy-scrollbar">
          {/* Logo and Title */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <a href="#" className="flex items-center gap-2 font-semibold text-blue-700">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                <img className="w-8 h-8" src={logo} alt="Easy Padhai" />
              </div>
              <span className="text-2xl md:text-3xl font-bold">Easy Padhai</span>
            </a>
            <Typography variant="h3" className="text-center mt-2">Terms & Conditions</Typography>
            <Typography variant="p" affects="muted" className="text-sm text-gray-500">
              Last Updated: May 15, 2025
            </Typography>
          </div>

          {/* Terms Content */}
          <div className="text-gray-800 leading-relaxed space-y-8">
            <section>
              <Typography variant="p">
                Welcome to <strong>Easy Padhai</strong>, a Learning Management System (LMS) with a web portal and mobile application connecting teachers and students for schools and coaching institutes. By using Easy Padhai’s web portal or app, you agree to these Terms and Conditions. If you do not agree, please refrain from using our services.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">1. Acceptance of Terms</Typography>
              <Typography variant="p" className="mb-4">
                By accessing or using Easy Padhai’s web portal or mobile app, you agree to these Terms and Conditions, and all applicable laws. These terms apply to all users, including admins, editors, teachers, students, and institutions.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">2. Eligibility</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>Admins, and editors must have authority to manage educational content or batches.</li>
                <li>Easy Padhai is designed for educational environments, including schools and coaching institutes.</li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">3. User Accounts</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>Admins and editors use the web portal to manage books, lessons, institutions, tests, and homework.</li>
                <li>Teacher must provide accurate information (e.g., name, email, institution) when creating an account on the app.</li>
                <li>Teachers and students use the app to access content, manage batches, and engage in learning.</li>
                <li>
                  You are responsible for securing your account credentials and notifying us at{" "}
                  <a href="mailto:chauhansir.easypadhai@gmail.com" className="text-blue-600 hover:underline">chauhansir.easypadhai@gmail.com</a>
                  {" "}of any unauthorized access.
                </li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">4. Use of Easy Padhai</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Admins/Editors</strong>: Add and manage books, lessons, descriptions, institutions, tests, and homework questions via the web portal, which syncs with the app.
                </li>
                <li>
                  <strong>Teachers</strong>: Create batches (selecting class/section), assign homework/tests, approve/reject batch members, and track scores. Class teachers have exclusive batch deletion rights.
                </li>
                <li>
                  <strong>Students</strong>: Join batches using codes, access homework/tests/books, and view scores.
                </li>
                <li>
                  <strong>Prohibited Actions</strong>:
                  <ul className="list-circle ml-6 space-y-1">
                    <li>Uploading or sharing inappropriate, offensive, or illegal content.</li>
                    <li>Accessing or modifying unauthorized data (e.g., other users’ batches or content).</li>
                    <li>Attempting to hack or reverse-engineer the web portal or app.</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">5. Content Ownership</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>User Content</strong>: Books, lessons, tests, homework, and messages created by admins, editors, or teachers remain your intellectual property. You grant Easy Padhai a non-exclusive, royalty-free license to store, display, and sync this content across the web portal and app.
                </li>
                <li>
                  <strong>Easy Padhai Content</strong>: The platform’s design, logos, and proprietary content are owned by Sudhir Chauhan. You may not reproduce or distribute them without permission.
                </li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">6. Termination</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>We may suspend or terminate your account for violating these terms, with or without notice.</li>
                <li>
                  You may delete your account by contacting{" "}
                  <a href="mailto:chauhansir.easypadhai@gmail.com" className="text-blue-600 hover:underline">chauhansir.easypadhai@gmail.com</a>.
                </li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">7. Limitation of Liability</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>Easy Padhai is provided “as is.” We do not guarantee error-free or uninterrupted service.</li>
                <li>Sudhir Chauhan is not liable for damages from use, including data loss or service disruptions.</li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">8. Changes to Terms</Typography>
              <Typography variant="p" className="mb-4">
                We may update these terms. Continued use of Easy Padhai after changes constitutes acceptance. Check{" "}
                <a href="https://codesuperb.com/terms-conditions" className="text-blue-600 hover:underline">easy-padhai.com/terms</a> for updates.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">9. Contact Us</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  For questions, contact{" "}
                  <a href="mailto:chauhansir.easypadhai@gmail.com" className="text-blue-600 hover:underline">chauhansir.easypadhai@gmail.com</a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}