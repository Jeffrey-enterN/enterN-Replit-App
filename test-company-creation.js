// Run this script in the browser console when logged in as an employer

// Test company data
const testCompany = {
  name: "TechInnovate Solutions",
  industries: ["Technology", "Software Development"],
  size: "51-200",
  headquarters: "Chicago, IL",
  about: "TechInnovate Solutions creates cutting-edge software solutions for businesses of all sizes.",
  workArrangements: ["Remote", "Hybrid", "On-site"],
  adminName: "Admin",
  adminEmail: "admin@techinnovate.com",
  isVerified: true
};

// Create company
fetch('/api/companies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testCompany),
  credentials: 'include'
})
.then(response => response.json())
.then(company => {
  console.log('Company created:', company);
  
  // Sample job postings for this company
  const jobs = [
    {
      title: "Software Engineering Intern",
      description: "Join our team to develop innovative software solutions using modern technologies.",
      location: "Chicago, IL",
      workType: ["Remote", "Hybrid"],
      employmentType: "Internship",
      department: "Engineering",
      companyId: company.id,
    },
    {
      title: "UX Design Intern",
      description: "Work with our design team to create beautiful and functional user interfaces.",
      location: "Chicago, IL",
      workType: ["Hybrid"],
      employmentType: "Internship",
      department: "Design",
      companyId: company.id,
    }
  ];
  
  // Create jobs sequentially
  return jobs.reduce((promise, job) => {
    return promise.then(() => {
      return fetch('/api/job-postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(job),
        credentials: 'include'
      })
      .then(response => response.json())
      .then(createdJob => {
        console.log('Job created:', createdJob);
        return createdJob;
      });
    });
  }, Promise.resolve());
})
.catch(error => {
  console.error('Error:', error);
});