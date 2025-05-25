import { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function Contact() {
  const [form, setForm] = useState({
    brandname: '',
    uniquename: '',
    phone1: '',
    phone2: '',
    phone3: '',
    tin: '',
    idType: '', // 'passport' or 'national'
    message: '',
    phoneCode1: '+251',
    phoneCode2: '+251',
    phoneCode3: '+251',
  });

  const [errors, setErrors] = useState({});
  const [frontImage, setFrontImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseName, setLicenseName] = useState(null);
  const [noLicense, setNoLicense] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setNoLicense(checked);
      if (checked) {
        setLicenseFile(null);
        setLicenseName(null);
        setErrors((prev) => ({ ...prev, license: null }));
      }
    } else {
      // For phone input, restrict typing in phone numbers and tin
      if (name === 'phone1' || name === 'phone2' || name === 'phone3') {
        // Allow only digits, max length 9
        if (/^\d{0,9}$/.test(value)) {
          setForm((prev) => ({ ...prev, [name]: value }));
          setErrors((prev) => ({ ...prev, phone: null }));
        }
        return;
      }
      if (name === 'tin') {
        // Allow only digits and dashes, max length 11 (e.g., 123-456-789)
        if (/^[0-9\-]{0,11}$/.test(value)) {
          setForm((prev) => ({ ...prev, [name]: value }));
          setErrors((prev) => ({ ...prev, tin: null }));
        }
        return;
      }
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneCodeChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateImage = (file) => {
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      return 'Image must be under 2MB';
    }
    return null;
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateImage(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [type]: error }));
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === 'front') {
      setFrontImage(file);
      setFrontPreview(url);
      setErrors((prev) => ({ ...prev, front: null }));
    } else {
      setBackImage(file);
      setBackPreview(url);
      setErrors((prev) => ({ ...prev, back: null }));
    }
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLicenseFile(file);
    setLicenseName(file.name);
    setErrors((prev) => ({ ...prev, license: null }));
  };

  const isPhoneValid = (num) => {
    // Phone must start with 9 and be 9 digits long (Ethiopian)
    return /^9\d{8}$/.test(num);
  };

  const validateTinFormat = (tin) => {
    // Example format: 123-456-789 (3 digits, dash, 3 digits, dash, 3 digits)
    return /^(\d{3}-\d{3}-\d{3})?$/.test(tin);
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!form.brandname) newErrors.brandname = 'Required';
    if (!form.uniquename) newErrors.uniquename = 'Required';

    // Phone validation: at least two valid phones required
    const validPhonesCount =
      (isPhoneValid(form.phone1) ? 1 : 0) + (isPhoneValid(form.phone2) ? 1 : 0);
    if (validPhonesCount < 2) {
      newErrors.phone = 'At least two valid phone numbers are required, starting with 9 and 9 digits long';
    }

    // TIN optional but if filled, must match format
    if (form.tin && !validateTinFormat(form.tin)) {
      newErrors.tin = 'TIN format must be 123-456-789';
    }

    // ID Type required
    if (!form.idType) {
      newErrors.idType = 'Please select ID type';
    }

    if (!frontImage) newErrors.front = `${form.idType === 'passport' ? 'Passport' : 'Front ID'} image is required`;

    if (form.idType === 'national' && !backImage) {
      newErrors.back = 'Back ID image is required';
    }

    if (!noLicense && !licenseFile) newErrors.license = 'Business license required unless you check the box';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Business Registration</h2>

        <input
          name="brandname"
          value={form.brandname}
          onChange={handleChange}
          placeholder="Brand name"
          className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
        />
        {errors.brandname && <p className="text-sm text-red-500">{errors.brandname}</p>}

        <input
          name="uniquename"
          value={form.uniquename}
          onChange={handleChange}
          placeholder="Unique name"
          className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
        />
        {errors.uniquename && <p className="text-sm text-red-500">{errors.uniquename}</p>}

        {/* TIN input with format placeholder */}
        <input
          name="tin"
          value={form.tin}
          onChange={handleChange}
          placeholder="TIN number (123-456-789)"
          className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
          maxLength={11}
        />
        {errors.tin && <p className="text-sm text-red-500">{errors.tin}</p>}

        {/* ID Type Select */}
        <select
          name="idType"
          value={form.idType}
          onChange={handleChange}
          className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
        >
          <option value="">Select ID type</option>
          <option value="passport">Passport</option>
          <option value="national">National ID</option>
        </select>
        {errors.idType && <p className="text-sm text-red-500">{errors.idType}</p>}

        {/* Phones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              name="phoneCode1"
              value={form.phoneCode1}
              onChange={handlePhoneCodeChange}
              className="p-4 rounded-xl border bg-white dark:bg-gray-800 mb-1"
            >
              <option value="+251">+251 (Ethiopia)</option>
            </select>
            <input
              name="phone1"
              value={form.phone1}
              onChange={handleChange}
              placeholder="Phone 1 (required)"
              className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
              maxLength={9}
            />
          </div>
          <div>
            <select
              name="phoneCode2"
              value={form.phoneCode2}
              onChange={handlePhoneCodeChange}
              className="p-4 rounded-xl border bg-white dark:bg-gray-800 mb-1"
            >
              <option value="+251">+251 (Ethiopia)</option>
            </select>
            <input
              name="phone2"
              value={form.phone2}
              onChange={handleChange}
              placeholder="Phone 2 (required)"
              className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
              maxLength={9}
            />
          </div>
          <div>
            <select
              name="phoneCode3"
              value={form.phoneCode3}
              onChange={handlePhoneCodeChange}
              className="p-4 rounded-xl border bg-white dark:bg-gray-800 mb-1"
            >
              <option value="+251">+251 (Ethiopia)</option>
            </select>
            <input
              name="phone3"
              value={form.phone3}
              onChange={handleChange}
              placeholder="Phone 3 (optional)"
              className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
              maxLength={9}
            />
          </div>
        </div>
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Your message (optional)"
          className="w-full p-4 rounded-xl border bg-white dark:bg-gray-800"
          rows={4}
        />

        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={noLicense} onChange={handleChange} />
            <span>No business license (this may reduce user trust)</span>
          </label>
        </div>

        {!noLicense && (
          <div>
            <label className="block font-semibold mb-1">Upload Business License *</label>
            <label className="block p-4 border-2 border-dashed rounded-xl bg-white dark:bg-gray-800 cursor-pointer text-sm">
              {licenseName || 'Click to upload'}
              <input type="file" onChange={handleLicenseChange} className="hidden" />
            </label>
            {errors.license && <p className="text-sm text-red-500">{errors.license}</p>}
          </div>
        )}

        {/* ID Front or Passport */}
        <div>
          <label className="block mb-1 font-semibold">
            {form.idType === 'passport' ? 'Passport *' : form.idType === 'national' ? 'Front of ID *' : 'Front of ID or Passport *'}
          </label>
          <label className="block w-full border-2 border-dashed p-4 rounded-xl text-center cursor-pointer">
            {frontPreview ? (
              <img src={frontPreview} alt="Front ID" className="mx-auto max-h-64 object-contain" />
            ) : (
              <span className="text-gray-400">Click to upload</span>
            )}
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'front')} className="hidden" />
          </label>
          {errors.front && <p className="text-sm text-red-500">{errors.front}</p>}
        </div>

        {/* Back of ID only if National ID */}
        {form.idType === 'national' && (
          <div>
            <label className="block mb-1 font-semibold">Back of ID *</label>
            <label className="block w-full border-2 border-dashed p-4 rounded-xl text-center cursor-pointer">
              {backPreview ? (
                <img src={backPreview} alt="Back ID" className="mx-auto max-h-64 object-contain" />
              ) : (
                <span className="text-gray-400">Click to upload</span>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'back')} className="hidden" />
            </label>
            {errors.back && <p className="text-sm text-red-500">{errors.back}</p>}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700"
        >
          Submit
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="max-w-lg mx-auto mt-32 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Agreement</h2>
        <ul className="text-sm space-y-2 text-gray-800 dark:text-gray-300">
          <li>✔ You must ship products within 2–3 business days.</li>
          <li>✔ We will contact You to receive the product.</li>
          <li>✔ You confirm your ID or passport images are clear and real.</li>
          <li>✔ If you skipped the license upload, it may reduce user trust.</li>
          <li>✔ You agree that fake documents or delays may get your account removed.</li>
        </ul>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">
            Cancel
          </button>
          <button
            onClick={() => {
              setIsModalOpen(false);
              alert('Form submitted');
              // Add your API submit here
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Agree & Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}
