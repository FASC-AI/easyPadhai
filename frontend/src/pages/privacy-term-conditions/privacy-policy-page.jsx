import { useEffect } from "react";
import Typography from "@/components/ui/typography";
import logo from "../../assets/images/logo.svg";
import * as XLSX from "xlsx";

export default function PrivacyPolicy() {
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
            <Typography variant="h3" className="text-center mt-2">Privacy Policy</Typography>
            <Typography variant="p" affects="muted" className="text-sm text-gray-500">
              Last Updated: May 15, 2025
            </Typography>
          </div>

          {/* Policy Content */}
          <div className="text-gray-800 leading-relaxed space-y-8">
            <section>
              <Typography variant="p">
                <strong>Easy Padhai</strong> is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web portal and mobile app, a Learning Management System (LMS) for schools and coaching institutes.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">1. Information We Collect</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Personal Information</strong>:
                  <ul className="list-circle ml-6 space-y-1">
                    <li>Email and other details when you register as an admin, editor, teacher, or student.</li>
                    <li>Batch codes and user roles for functionality.</li>
                  </ul>
                </li>
                <li>
                  <strong>Content Data</strong>:
                  <ul className="list-circle ml-6 space-y-1">
                    <li>Books, lessons, test questions, homework, and messages created by admins, editors, or teachers.</li>
                    <li>Student test scores and responses.</li>
                  </ul>
                </li>
                <li>
                  <strong>Usage Data</strong>:
                  <ul className="list-circle ml-6 space-y-1">
                    <li>Interactions with the web portal (e.g., content uploads) and app (e.g., batch access).</li>
                  </ul>
                </li>
                <li>
                  <strong>Device Information</strong>:
                  <ul className="list-circle ml-6 space-y-1">
                    <li>Device type, OS, and IP address for analytics and security.</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">2. How We Use Your Information</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Service Delivery</strong>: Sync web portal content (books, tests) to the app, manage batches, and enable teacher-student interactions.</li>
                <li><strong>Account Management</strong>: Authenticate users and secure access.</li>
                <li><strong>Improvement</strong>: Analyze usage to enhance the platform.</li>
                <li><strong>Communication</strong>: Send updates, support, or service-related notifications.</li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">3. How We Share Your Information</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Within Easy Padhai</strong>: Share data (e.g., test scores, homework) with teachers/students in your batch for educational purposes.</li>
                <li><strong>Service Providers</strong>: Share with trusted providers (e.g., cloud hosting) under confidentiality agreements.</li>
                <li><strong>Legal Compliance</strong>: Disclose data if required by law or to protect our rights.</li>
                <li>We do not sell your personal information.</li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">4. Data Security</Typography>
              <Typography variant="p" className="mb-2">
                We use encryption and secure servers to protect your data. However, no system is fully secure, and we cannot guarantee absolute protection.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">5. Data Retention</Typography>
              <Typography variant="p" className="mb-2">
                We retain data for as long as your account is active or as needed for services. Request deletion at{" "}
                <a href="mailto:chauhansir.easypadhai@gmail.com" className="text-blue-600 hover:underline">chauhansir.easypadhai@gmail.com</a>
                ; we will comply unless legally required to retain data.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">6. Your Rights</Typography>
              <Typography variant="p" className="mb-2">You may:</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>Access, correct, or delete your data.</li>
                <li>
                  Opt out of analytics (contact{" "}
                  <a href="mailto:chauhansir.easypadhai@gmail.com" className="text-blue-600 hover:underline">chauhansir.easypadhai@gmail.com</a>
                  ).
                </li>
                <li>Exercise rights under local laws.</li>
              </ul>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">7. Third-Party Links</Typography>
              <Typography variant="p" className="mb-2">
                The web portal or app may include external links (e.g., reference materials). We are not responsible for their privacy practices.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">8. Changes to This Policy</Typography>
              <Typography variant="p" className="mb-2">
                We may update this policy and notify you via email or app. Continued use after changes implies acceptance. Check{" "}
                <a href="https://codesuperb.com/privacy-policy" className="text-blue-600 hover:underline">easy-padhai.com/privacy</a> for updates.
              </Typography>
            </section>

            <section>
              <Typography variant="h4" className="mt-4 mb-2 text-blue-800">9. Contact Us</Typography>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  For privacy concerns, contact{" "}
                  <a href="mailto:chauhansir.easypadhai@gmail.com" className="text-blue-600 hover:underline">chauhansir.easypadhai@gmail.com</a>.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}