import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Logo from "../components/Logo";
import { register } from "../services/api";
import { showSuccess, showError } from "../utils/premiumAlert";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "student" | "lecturer" | "jobprovider" | "clubpresident";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  age: string;
  nic: string;
  phonenumber: string;
  // Student
  university: string;
  faculty: string;
  academicYear: string;
  studentId: string;
  // Lecturer
  department: string;
  lecturerId: string;
  // Job Provider
  companyName: string;
  designation: string;
  companyWebsite: string;
  // Club President
  clubName: string;
}

interface RoleCardProps {
  type: UserRole;
  icon: LucideIcon;
  title: string;
  description: string;
  onSelect: (role: UserRole) => void;
}

type ApiError = {
  response?: { data?: { message?: string } };
};

// ─── RoleCard ─────────────────────────────────────────────────────────────────

const RoleCard: React.FC<RoleCardProps> = ({
  type,
  icon: Icon,
  title,
  description,
  onSelect,
}) => (
  <button
    onClick={() => onSelect(type)}
    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-[#FBB017] hover:shadow-md transition-all group text-left w-full"
  >
    <div className="bg-[#F0F2F5] group-hover:bg-[#FFF9EE] p-4 rounded-2xl w-fit mb-4 transition-colors">
      <Icon
        className="text-[#2D3A5D] group-hover:text-[#FBB017] transition-colors"
        size={32}
      />
    </div>
    <h3 className="text-xl font-bold text-[#2D3A5D] mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </button>
);

// ─── RegisterPage ─────────────────────────────────────────────────────────────

const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    age: "",
    nic: "",
    phonenumber: "",
    university: "",
    faculty: "",
    academicYear: "",
    studentId: "",
    department: "",
    lecturerId: "",
    companyName: "",
    designation: "",
    companyWebsite: "",
    clubName: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "phonenumber") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "nic") {
      const upperValue = value.toUpperCase();

      if (/^\d{0,11}V?$/.test(upperValue)) {
        sanitizedValue = upperValue.slice(0, 12);
      } else {
        return;
      }
    }

    if (name === "age") {
      sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(formData.phonenumber)) {
      setError("Phone number must contain exactly 10 digits");
      return;
    }

    if (role !== "clubpresident") {
      if (!/^\d{11}V$/.test(formData.nic)) {
        setError(
          "NIC must be 12 characters: 11 numbers and only 'V' as the last letter",
        );
        return;
      }

      const ageNumber = Number(formData.age);

      if (!/^\d{1,3}$/.test(formData.age) || ageNumber < 0) {
        setError("Age must be a positive number with a maximum of 3 digits");
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;

      const finalData =
        role === "clubpresident"
          ? { ...submitData }
          : { ...submitData, age: parseInt(formData.age, 10) };

      await register(role, finalData);

      if (role === "clubpresident") {
        await showSuccess(
          "Account Submitted",
          "Your account is pending Admin approval. Please wait for an administrator to activate your account before logging in."
        );
      } else {
        const roleName = role!.charAt(0).toUpperCase() + role!.slice(1);
        await showSuccess("Success", `${roleName} registered successfully!`);
      }
      navigate("/login");
    } catch (err: unknown) {
      const msg = (err as ApiError).response?.data?.message || "Registration failed. Please fill all required fields correctly.";
      showError("Registration Failed", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Role Selection Screen ───────────────────────────────────────────────────

  if (!role) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <Logo className="mb-12 scale-125" />
        <div className="max-w-5xl w-full">
          <h2 className="text-3xl font-bold text-[#2D3A5D] text-center mb-4">
            Join NotifiU
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Select your account type to get started
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RoleCard
              type="student"
              icon={GraduationCap}
              title="Student"
              description="Register as a student to explore learning and campus life."
              onSelect={setRole}
            />
            <RoleCard
              type="lecturer"
              icon={BookOpen}
              title="Lecturer"
              description="Register as a lecturer to manage academic posts."
              onSelect={setRole}
            />
            <RoleCard
              type="jobprovider"
              icon={Briefcase}
              title="Job Provider"
              description="Register as a job provider to post opportunities."
              onSelect={setRole}
            />
            <RoleCard
              type="clubpresident"
              icon={GraduationCap}
              title="Club President"
              description="Register to manage university events and announcements."
              onSelect={setRole}
            />
          </div>

          <div className="mt-12 text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-[#FBB017] font-semibold">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Registration Form ───────────────────────────────────────────────────────

  const inputClass =
    "w-full bg-[#F0F2F5] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#FBB017] outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 max-w-2xl w-full my-8 relative">
        <button
          onClick={() => setRole(null)}
          className="absolute left-8 top-12 text-gray-400 hover:text-[#2D3A5D] flex items-center gap-1 transition-colors group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back</span>
        </button>

        <div className="flex flex-col items-center mb-10">
          <Logo className="mb-2" />
          <h2 className="text-gray-400 font-medium text-lg">
            Register as{" "}
            <span className="text-[#FBB017] capitalize">{role}</span>
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Common Fields */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              placeholder="0771234567"
              className={inputClass}
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
              Password
            </label>
            <div className="relative overflow-hidden rounded-2xl">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-[#F0F2F5] p-1 z-10"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
              Confirm Password
            </label>
            <div className="relative overflow-hidden rounded-2xl">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-[#F0F2F5] p-1 z-10"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* NIC and Age - hidden for Club President */}
          {role !== "clubpresident" && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  NIC Number
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  placeholder="12345678901V"
                  className={inputClass}
                  maxLength={12}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="22"
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={3}
                  required
                />
              </div>
            </>
          )}

          {/* Student Fields */}
          {role === "student" && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  University
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="UoM"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Faculty
                </label>
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  placeholder="Engineering"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="2nd Year"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="IT2024"
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}

          {/* Club President Fields - Simplified */}
          {role === "clubpresident" && (
            <>
              <div className="col-span-1 md:col-span-2">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
                  <p className="text-amber-700 text-sm font-semibold">
                    👑 Club President Registration
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    Your account requires Admin approval before you can log in.
                    You will be notified once approved.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  University
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="University of Moratuwa"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="IT2024XXXXX"
                  className={inputClass}
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Club Name
                </label>
                <input
                  type="text"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleChange}
                  placeholder="e.g., IEEE Student Branch, AIESEC, Leo Club"
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}

          {/* Lecturer Fields */}
          {role === "lecturer" && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department of Computer Science"
                className={inputClass}
                required
              />
            </div>
          )}

          {/* Job Provider Fields */}
          {role === "jobprovider" && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                  Company Website
                </label>
                <input
                  type="text"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}

          {/* Address - hidden for Club President (not required) */}
          {role !== "clubpresident" && (
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2 pl-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className={`${inputClass} min-h-[100px]`}
                required
              />
            </div>
          )}

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FBB017] hover:bg-[#e9a215] text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-[#FBB017] font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;