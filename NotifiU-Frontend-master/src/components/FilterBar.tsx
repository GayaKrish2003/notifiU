import React from 'react';

interface FilterBarProps {
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
    const selectClass = "bg-[#F0F2F5] border-none rounded-2xl px-5 py-3 text-[11px] font-black text-[#2D3A5D] uppercase tracking-widest focus:ring-2 focus:ring-[#FBB017] outline-none cursor-pointer transition-all";
    return (
        <div className="flex items-center gap-3 mb-8">
            <select name="category" onChange={onFilterChange} title="Filter by Category" className={selectClass}>
                <option value="">All Categories</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Club Activity">Club Activity</option>
                <option value="Sports">Sports</option>
                <option value="Musical">Musical</option>
            </select>
            <select name="organizingClub" onChange={onFilterChange} title="Filter by Club" className={selectClass}>
                <option value="">All Clubs</option>
                <option value="Tech Club">Tech Club</option>
                <option value="Art Club">Art Club</option>
                <option value="Sports Club">Sports Club</option>
                <option value="Student Council">Student Council</option>
                <option value="IT Club">IT Club</option>
            </select>
        </div>
    );
};

export default FilterBar;
