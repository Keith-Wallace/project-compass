import { Stack } from '@mantine/core';
import { Button } from "../shared/components/button/Button";
import { Input } from '../shared/components/form/Input';
import { Form, type FormValidation } from '../shared/components/form/Form';
import { Select } from '../shared/components/form/Select';
import { RadioGroup } from '../shared/components/form/RadioGroup';
import { FormAutocomplete } from '../shared/components/form/FormAutoComplete';
import { MultiSelect } from '../shared/components/form/MultiSelect';
import { TextArea } from '../shared/components/form/TextArea';
import { FileInput } from '../shared/components/form/FileInput';
import { DatePickerInput } from '../shared/components/form/DatePickerInput';


const BUTTON_VARIANTS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "cancel", label: "Cancel" },
] as const;

interface ExampleFormValues {
  name: string;
  role: string;
  contactMethod: string;
  favoriteLibrary: string;
  favoriteLibraryAuto: string[];
  textAreaResponse: string;
  fileInput: string;
  datePickerInput: string | null;
}
 
const validation: FormValidation<ExampleFormValues> = {
  name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
  role: (value) => (value ? null : 'Select a role'),
  contactMethod: (value) => (value ? null : 'Select a contact method'),
  favoriteLibrary: (value) => (value ? null : 'Select a favorite library'),
  favoriteLibraryAuto: (value) => (value.length > 0 ? null : 'Select a favorite library Auto'),
  textAreaResponse: (value) => (value ? null : 'Need to add a short story'),
  fileInput: (value) => (value ? null : 'Please upload a file'),
  datePickerInput: (value) => (value ? null : 'Please select a date'),
};


export const StyleGuide = () => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th scope="col">
              <h2>Buttons</h2>
            </th>
          </tr>
        </thead>
        <tbody>
          {BUTTON_VARIANTS.map(({ key, label }) => (
            <tr key={key}>
              <th scope="row">{label}</th>
              <td>
                <Button variant={key}>{label}</Button>
              </td>
              <td>
                <Button variant={key} disabled>
                  {label}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
        <thead>
          <tr>
            <th scope="col">
              <h2>Form</h2>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{"paddingTop": "48px"}}>
              <Form<ExampleFormValues>
                initialValues={{
                  name: '',
                  role: '',
                  contactMethod: '',
                  favoriteLibrary: '',
                  favoriteLibraryAuto: [],
                  textAreaResponse: '',
                  fileInput: '',
                  datePickerInput: null
                }}
                validation={validation}
                onSubmit={(values) => console.log(values)}
              >
                {(form) => (
                  <Stack>
                    <Input
                      form={form}
                      name="name"
                      label="Name"
                      placeholder="Your name"
                    />
          
                    <Select
                      form={form}
                      name="role"
                      label="Role"
                      placeholder="Select role"
                      data={[
                        { value: 'engineer', label: 'Engineer' },
                        { value: 'designer', label: 'Designer' },
                        { value: 'manager', label: 'Manager' },
                      ]}
                    />
          
                    <RadioGroup
                      form={form}
                      name="contactMethod"
                      label="Preferred contact method"
                      options={[
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Phone' },
                      ]}
                    />
                    <FormAutocomplete
                      form={form}
                      label="Your favorite library"
                      name="favoriteLibrary"
                      placeholder="Pick value or enter anything"
                      data={['React', 'Angular', 'Vue', 'Svelte']}
                    />

                    <MultiSelect
                      form={form}
                      label="Your favorite library"
                      name="favoriteLibraryAuto"
                      placeholder="Pick one or many values"
                      data={['React', 'Angular', 'Vue', 'Svelte']}
                    />

                    <TextArea
                      form={form}
                      label="Add a Short Story"
                      name="textAreaResponse"
                      placeholder="Add a Short Story"
                    />

                    <FileInput
                      form={form}
                      label="Upload a File"
                      name="fileInput"
                      placeholder="Upload a File"
                    />

                    <DatePickerInput
                      form={form}
                      label="Select a Date"
                      name="datePickerInput"
                      placeholder="Select a Date"
                    />



          
                    <Button type="submit">Submit</Button>
                  </Stack>
                )}
              </Form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
};



// import { Button } from "../../../shared/components/buttons/Button";
// import "./button-style-guide.css";

// import { Form } from "../../components/form/Form";
// import { TextField } from "../../components/form/TextField";
// import { SelectField } from "../../components/form/SelectField";


// // Adjust the import path above to match wherever this page lives relative
// // to shared/components/Buttons/Buttons.tsx in your feature-first structure.

// const VARIANTS = [
//   { key: "primary", label: "Primary" },
//   { key: "secondary", label: "Secondary" },
//   { key: "cancel", label: "Cancel" },
// ] as const;


// const US_STATES = [
//   { label: 'Alabama', value: 'AL' },
//   { label: 'Alaska', value: 'AK' },
//   { label: 'Arizona', value: 'AZ' },
//   { label: 'Arkansas', value: 'AR' },
//   { label: 'California', value: 'CA' },
//   { label: 'Colorado', value: 'CO' },
//   { label: 'Connecticut', value: 'CT' },
//   { label: 'Delaware', value: 'DE' },
//   { label: 'Florida', value: 'FL' },
//   { label: 'Georgia', value: 'GA' },
//   { label: 'Hawaii', value: 'HI' },
//   { label: 'Idaho', value: 'ID' },
//   { label: 'Illinois', value: 'IL' },
//   { label: 'Indiana', value: 'IN' },
//   { label: 'Iowa', value: 'IA' },
//   { label: 'Kansas', value: 'KS' },
//   { label: 'Kentucky', value: 'KY' },
//   { label: 'Louisiana', value: 'LA' },
//   { label: 'Maine', value: 'ME' },
//   { label: 'Maryland', value: 'MD' },
//   { label: 'Massachusetts', value: 'MA' },
//   { label: 'Michigan', value: 'MI' },
//   { label: 'Minnesota', value: 'MN' },
//   { label: 'Mississippi', value: 'MS' },
//   { label: 'Missouri', value: 'MO' },
//   { label: 'Montana', value: 'MT' },
//   { label: 'Nebraska', value: 'NE' },
//   { label: 'Nevada', value: 'NV' },
//   { label: 'New Hampshire', value: 'NH' },
//   { label: 'New Jersey', value: 'NJ' },
//   { label: 'New Mexico', value: 'NM' },
//   { label: 'New York', value: 'NY' },
//   { label: 'North Carolina', value: 'NC' },
//   { label: 'North Dakota', value: 'ND' },
//   { label: 'Ohio', value: 'OH' },
//   { label: 'Oklahoma', value: 'OK' },
//   { label: 'Oregon', value: 'OR' },
//   { label: 'Pennsylvania', value: 'PA' },
//   { label: 'Rhode Island', value: 'RI' },
//   { label: 'South Carolina', value: 'SC' },
//   { label: 'South Dakota', value: 'SD' },
//   { label: 'Tennessee', value: 'TN' },
//   { label: 'Texas', value: 'TX' },
//   { label: 'Utah', value: 'UT' },
//   { label: 'Vermont', value: 'VT' },
//   { label: 'Virginia', value: 'VA' },
//   { label: 'Washington', value: 'WA' },
//   { label: 'West Virginia', value: 'WV' },
//   { label: 'Wisconsin', value: 'WI' },
//   { label: 'Wyoming', value: 'WY' },
// ] as const;
 
// type USState = (typeof US_STATES)[number]['value'];
 
// interface CredentialFormValues {
//   credentialName: string;
//   state: USState | null;
// }




// export const ButtonStyleGuide = () => {
//   return (
//     <div className="button-style-guide">
//       <header className="button-style-guide__header">
//         <h1>Button style guide</h1>
//         <p>
//           Live examples of every Button variant, rendered with the real
//           shared component — nothing here is mocked, so what you see is
//           exactly what ships.
//         </p>
//       </header>

//       <table className="button-style-guide__table">
//         <thead>
//           <tr>
//             <th scope="col">Variant</th>
//             <th scope="col">Default</th>
//             <th scope="col">Disabled</th>
//           </tr>
//         </thead>
//         <tbody>
//           {VARIANTS.map(({ key, label }) => (
//             <tr key={key}>
//               <th scope="row">{label}</th>
//               <td>
//                 <Button variant={key}>{label}</Button>
//               </td>
//               <td>
//                 <Button variant={key} disabled>
//                   {label}
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* <section className="button-style-guide__notes">
//         <h2>Interactive states</h2>
//         <p>
//           These buttons are live, so the remaining states are one
//           interaction away:
//         </p>
//         <ul>
//           <li>Hover any button above to check the hover treatment.</li>
//           <li>Tab to a button to check the focus ring.</li>
//           <li>Press and hold a button to check the active/pressed state.</li>
//         </ul>
//       </section> */}

//       <header className="button-style-guide__header">
//         <h1>Forms style guide</h1>
//         <p>
//           tba
//         </p>
//       </header>
      
//       <Form
//         onFormSubmit={(formValues: CredentialFormValues) => {
//         console.log('submitted', formValues);
//       }}

//       >
//         <TextField
//           name="First Name"
//           label="First Name"
//           placeholder="Please enter your first name"
//           required
//         />

//         <TextField
//           name="Last Name"
//           label="Last Name"
//           placeholder="Please enter your last name"
//           required
//         />

//         <SelectField<USState>
//           name="state"
//           label="State"
//           items={US_STATES}
//           placeholder="Select a state"
//           required
//         />

//         <Button
//           type="submit"
//         >
//           Submit Form
//         </Button>

//       </Form>

//     </div>
//   );
// };

// import { useForm } from '@mantine/form';
// import { Button, Stack } from '@mantine/core';
// import { FormInput, FormSelect, FormRadioGroup } from '../../../shared/components/form/Mantine'
 
// interface ExampleFormValues {
//   name: string;
//   role: string;
//   contactMethod: string;
// }
 
// export const ButtonStyleGuide = () => {
//   const form = useForm<ExampleFormValues>({
//     initialValues: {
//       name: '',
//       role: '',
//       contactMethod: '',
//     },
//     validate: {
//       name: (value) => (value.trim().length === 0 ? 'Name is required!!' : null),
//       role: (value) => (value ? null : 'Select a role'),
//       contactMethod: (value) => (value ? null : 'Select a contact method'),
//     },
//   });
 
//   const handleSubmit = form.onSubmit((values) => {
//     console.log(values);
//   });
 
//   return (
//     <form onSubmit={handleSubmit}>
//       <Stack>
//         <FormInput className="HELLO" form={form} name="name" label="Name" placeholder="Your name" />
 
//         <FormSelect
//           className="HELLO"
//           form={form}
//           name="role"
//           label="Role"
//           placeholder="Select role"
//           data={[
//             { value: 'engineer', label: 'Engineer' },
//             { value: 'designer', label: 'Designer' },
//             { value: 'manager', label: 'Manager' },
//           ]}
//         />
 
//         <FormRadioGroup
//           className="HELLO"
//           form={form}
//           name="contactMethod"
//           label="Preferred contact method"
//           options={[
//             { value: 'email', label: 'Email' },
//             { value: 'phone', label: 'Phone' },
//           ]}
//         />
 
//         <Button type="submit">Submit</Button>
//       </Stack>
//     </form>
//   );
// }
