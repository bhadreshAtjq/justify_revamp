export const SAMPLES = {
  marksheet: {
    filename: "marksheet_sample.csv",
    content: `Registration_No,Name,GPA,Subject 1 Code,Subject 1 Name,Subject 1 Credits,Subject 1 Grade,Subject 2 Code,Subject 2 Name,Subject 2 Credits,Subject 2 Grade
2024001,Rahul Sharma,8.75,CS101,Programming in C,4.0,9.0,MA101,Mathematics I,3.0,8.0
2024002,Priya Patel,9.12,CS101,Programming in C,4.0,10.0,MA101,Mathematics I,3.0,9.0`
  },
  certificate: {
    filename: "certificate_sample.csv",
    content: `Certificate_No,Student Name,Degree,Branch,Completion_Year,OGPA,Issue_Date,Class
CERT-2024-001,Arjun Kumar,Bachelor of Technology,Information Technology,2024,8.95,2024-06-12,First Class with Distinction
CERT-2024-002,Deepa Nair,Bachelor of Science,Physics,2024,9.10,2024-06-15,First Class`
  },
  transcript: {
    filename: "transcript_sample.csv",
    content: `Registration_No,Name,Degree,Admission_Year,Completion_Year,OGPA,Result,Sem1_Year,Sem1_Name,Sem1_GPA,Sem1_C1_Code,Sem1_C1_Name,Sem1_C1_Credit_Points,Sem1_C2_Code,Sem1_C2_Name,Sem1_C2_Credit_Points
20205639,Amitabh Bachchan,Bachelor of Arts,2020,2024,8.50,Pass,2020,Semester I,8.20,BA101,Introduction to Drama,4.0,BA102,Classical Literature,3.5`
  }
};

export function downloadSample(type: "marksheet" | "certificate" | "transcript") {
  const sample = SAMPLES[type];
  const blob = new Blob([sample.content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", sample.filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
