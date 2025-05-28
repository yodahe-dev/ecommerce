import { useState, useRef, useEffect } from 'react';
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
    idType: '',
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
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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
      if (name === 'phone1' || name === 'phone2' || name === 'phone3') {
        if (/^\d{0,9}$/.test(value)) {
          setForm((prev) => ({ ...prev, [name]: value }));
          setErrors((prev) => ({ ...prev, phone: null }));
        }
        return;
      }
      if (name === 'tin') {
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
    return /^9\d{8}$/.test(num);
  };

  const validateTinFormat = (tin) => {
    return /^(\d{3}-\d{3}-\d{3})?$/.test(tin);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.brandname) newErrors.brandname = 'Required';
    if (!form.uniquename) newErrors.uniquename = 'Required';

    const validPhonesCount =
      (isPhoneValid(form.phone1) ? 1 : 0) + (isPhoneValid(form.phone2) ? 1 : 0);
    if (validPhonesCount < 2) {
      newErrors.phone = 'At least two valid phone numbers are required, starting with 9 and 9 digits long';
    }

    if (form.tin && !validateTinFormat(form.tin)) {
      newErrors.tin = 'TIN format must be 123-456-789';
    }

    if (!form.idType) {
      newErrors.idType = 'Please select ID type';
    }

    if (!frontImage) newErrors.front = `${form.idType === 'passport' ? 'Passport' : 'Front ID'} image is required`;

    if (form.idType === 'national' && !backImage) {
      newErrors.back = 'Back ID image is required';
    }

    if (!noLicense && !licenseFile) newErrors.license = 'Business license required unless you check the box';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsModalOpen(true);
    } else {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = () => {
    setIsModalOpen(false);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setForm({
          brandname: '',
          uniquename: '',
          phone1: '',
          phone2: '',
          phone3: '',
          tin: '',
          idType: '',
          message: '',
          phoneCode1: '+251',
          phoneCode2: '+251',
          phoneCode3: '+251',
        });
        setFrontImage(null);
        setFrontPreview(null);
        setBackImage(null);
        setBackPreview(null);
        setLicenseFile(null);
        setLicenseName(null);
        setNoLicense(false);
        setSuccess(false);
        setActiveSection(0);
      }, 3000);
    }, 1500);
  };

  const nextSection = () => {
    if (activeSection === 0) {
      // Validate business info
      const newErrors = {};
      if (!form.brandname) newErrors.brandname = 'Required';
      if (!form.uniquename) newErrors.uniquename = 'Required';
      if (form.tin && !validateTinFormat(form.tin)) {
        newErrors.tin = 'TIN format must be 123-456-789';
      }
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setActiveSection(1);
      }
    } else if (activeSection === 1) {
      // Validate contact info
      const newErrors = {};
      const validPhonesCount =
        (isPhoneValid(form.phone1) ? 1 : 0) + (isPhoneValid(form.phone2) ? 1 : 0);
      if (validPhonesCount < 2) {
        newErrors.phone = 'At least two valid phone numbers are required';
      }
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setActiveSection(2);
      }
    } else if (activeSection === 2) {
      // Validate ID info
      const newErrors = {};
      if (!form.idType) newErrors.idType = 'Please select ID type';
      if (!frontImage) newErrors.front = `${form.idType === 'passport' ? 'Passport' : 'Front ID'} image is required`;
      if (form.idType === 'national' && !backImage) newErrors.back = 'Back ID image is required';
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setActiveSection(3);
      }
    } else {
      handleSubmit();
    }
  };

  const prevSection = () => {
    if (activeSection > 0) setActiveSection(prev => prev - 1);
  };

  const SectionIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3, 4].map((num, index) => (
        <div key={num} className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${activeSection === index ? 'bg-orange-500 text-white' : 
                index < activeSection ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            {num}
          </div>
          {index < 3 && (
            <div className={`w-16 h-1 ${index < activeSection ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const sectionTitles = [
    "Business Information",
    "Contact Details",
    "Identity Verification",
    "Business License"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Business Registration
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Register your business to start selling on our platform. All fields are required unless marked as optional.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {sectionTitles[activeSection]}
              </h2>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {activeSection + 1} of 4
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8" ref={formRef}>
            <SectionIndicator />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mb-4"></div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">Processing your registration...</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">This may take a few seconds</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Registration Successful!</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Your business has been registered successfully. Our team will review your submission and contact you within 24 hours.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-8 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-all duration-300"
                >
                  Register Another Business
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Section 1: Business Information */}
                {activeSection === 0 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Brand Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="brandname"
                        value={form.brandname}
                        onChange={handleChange}
                        placeholder="Enter your brand name"
                        className={`w-full p-4 rounded-xl border ${errors.brandname ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      />
                      {errors.brandname && <p className="mt-1 text-sm text-red-500">{errors.brandname}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Unique Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="uniquename"
                        value={form.uniquename}
                        onChange={handleChange}
                        placeholder="Enter a unique business identifier"
                        className={`w-full p-4 rounded-xl border ${errors.uniquename ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      />
                      {errors.uniquename && <p className="mt-1 text-sm text-red-500">{errors.uniquename}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        TIN Number (Tax Identification Number)
                      </label>
                      <input
                        name="tin"
                        value={form.tin}
                        onChange={handleChange}
                        placeholder="123-456-789 (optional)"
                        className={`w-full p-4 rounded-xl border ${errors.tin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                        maxLength={11}
                      />
                      {errors.tin && <p className="mt-1 text-sm text-red-500">{errors.tin}</p>}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: 123-456-789</p>
                    </div>
                  </div>
                )}
                
                {/* Section 2: Contact Details */}
                {activeSection === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone 1 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <select
                            name="phoneCode1"
                            value={form.phoneCode1}
                            onChange={handlePhoneCodeChange}
                            className="p-4 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                            disabled
                          >
                            <option value="+251">+251</option>
                          </select>
                          <input
                            name="phone1"
                            value={form.phone1}
                            onChange={handleChange}
                            placeholder="9XXXXXXXX"
                            className={`flex-1 p-4 rounded-r-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            maxLength={9}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone 2 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <select
                            name="phoneCode2"
                            value={form.phoneCode2}
                            onChange={handlePhoneCodeChange}
                            className="p-4 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                            disabled
                          >
                            <option value="+251">+251</option>
                          </select>
                          <input
                            name="phone2"
                            value={form.phone2}
                            onChange={handleChange}
                            placeholder="9XXXXXXXX"
                            className={`flex-1 p-4 rounded-r-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            maxLength={9}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone 3 (Optional)
                        </label>
                        <div className="flex">
                          <select
                            name="phoneCode3"
                            value={form.phoneCode3}
                            onChange={handlePhoneCodeChange}
                            className="p-4 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                            disabled
                          >
                            <option value="+251">+251</option>
                          </select>
                          <input
                            name="phone3"
                            value={form.phone3}
                            onChange={handleChange}
                            placeholder="9XXXXXXXX"
                            className={`flex-1 p-4 rounded-r-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            maxLength={9}
                          />
                        </div>
                      </div>
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Information
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us about your business, products, or any special requirements"
                        className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                  </div>
                )}
                
                {/* Section 3: Identity Verification */}
                {activeSection === 2 && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ID Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, idType: 'passport' }))}
                          className={`p-4 rounded-xl border-2 ${form.idType === 'passport' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600'} transition-all duration-200 flex items-center justify-center`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          Passport
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, idType: 'national' }))}
                          className={`p-4 rounded-xl border-2 ${form.idType === 'national' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600'} transition-all duration-200 flex items-center justify-center`}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                          National ID
                        </button>
                      </div>
                      {errors.idType && <p className="mt-2 text-sm text-red-500">{errors.idType}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {form.idType === 'passport' ? 'Passport Photo' : 'Front of ID'} <span className="text-red-500">*</span>
                        </label>
                        <label className={`block w-full rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed ${errors.front ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} transition-colors duration-300 hover:border-orange-500`}>
                          {frontPreview ? (
                            <div className="relative">
                              <img 
                                src={frontPreview} 
                                alt="ID Front" 
                                className="w-full h-64 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-medium">Change Image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-8">
                              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p className="text-gray-500 dark:text-gray-400 text-center">
                                Click to upload {form.idType === 'passport' ? 'passport photo' : 'front of ID'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">Max size: 2MB</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageChange(e, 'front')} 
                            className="hidden" 
                          />
                        </label>
                        {errors.front && <p className="mt-1 text-sm text-red-500">{errors.front}</p>}
                      </div>
                      
                      {form.idType === 'national' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Back of ID <span className="text-red-500">*</span>
                          </label>
                          <label className={`block w-full rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed ${errors.back ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} transition-colors duration-300 hover:border-orange-500`}>
                            {backPreview ? (
                              <div className="relative">
                                <img 
                                  src={backPreview} 
                                  alt="ID Back" 
                                  className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                  <span className="text-white font-medium">Change Image</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-8">
                                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 text-center">
                                  Click to upload back of ID
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Max size: 2MB</p>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageChange(e, 'back')} 
                              className="hidden" 
                            />
                          </label>
                          {errors.back && <p className="mt-1 text-sm text-red-500">{errors.back}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Section 4: Business License */}
                {activeSection === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business License
                      </label>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex items-center h-5">
                          <input 
                            id="no-license" 
                            type="checkbox" 
                            checked={noLicense} 
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                          />
                        </div>
                        <div className="text-sm">
                          <label htmlFor="no-license" className="font-medium text-gray-700 dark:text-gray-300">
                            I don't have a business license
                          </label>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Checking this box will allow you to proceed without a license, but may reduce customer trust in your business.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {!noLicense && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Business License <span className="text-red-500">*</span>
                        </label>
                        <label className={`block p-8 rounded-2xl border-2 border-dashed ${errors.license ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} transition-colors duration-300 hover:border-orange-500 cursor-pointer`}>
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-center">
                              {licenseName ? licenseName : 'Click to upload business license'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, or image files (Max size: 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            onChange={handleLicenseChange} 
                            className="hidden" 
                          />
                        </label>
                        {errors.license && <p className="mt-1 text-sm text-red-500">{errors.license}</p>}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-10 flex justify-between">
                  <button
                    type="button"
                    onClick={prevSection}
                    disabled={activeSection === 0}
                    className={`px-6 py-3 rounded-xl font-medium ${activeSection === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={nextSection}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {activeSection === 3 ? 'Review and Submit' : 'Continue'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Your information is securely stored and will only be used for verification purposes.</p>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="max-w-lg w-full mx-auto my-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        closeTimeoutMS={300}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Terms & Conditions</h2>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 mb-6 rounded">
            <p className="text-orange-700 dark:text-orange-300">Please review the following terms before submitting your registration:</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="ml-3 text-gray-700 dark:text-gray-300">
                You must ship products within 2–3 business days of receiving an order.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="ml-3 text-gray-700 dark:text-gray-300">
                Our team may contact you to verify your information and receive product samples.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="ml-3 text-gray-700 dark:text-gray-300">
                You confirm that all documents provided are clear, valid, and authentic.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="ml-3 text-gray-700 dark:text-gray-300">
                Skipping business license upload may reduce customer trust in your business.
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="ml-3 text-gray-700 dark:text-gray-300">
                Fake documents or repeated shipping delays may result in account suspension.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalSubmit}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Agree & Submit Registration
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}