import {useState, useRef, RefObject} from 'react';
import { Select, TextField, MenuItem, TextareaAutosize } from '@mui/material';
import {useForm} from "react-hook-form";
import configData from '../config.json';
import ReCAPTCHA from 'react-google-recaptcha';

const Request = () => {
    const sitekey = configData.RECAPTCHA_SITE_KEY;
    const recaptchaRef: RefObject<ReCAPTCHA> = useRef<ReCAPTCHA>(null);
    const {register, handleSubmit, watch, formState: {errors}} = useForm();
    const handleChange = (change: any) => setSelect(change.target.value);
    const [select, setSelect] = useState(1);
    const onSubmit = async (data: any) => {
        const captchaToken = await recaptchaRef.current?.executeAsync(); 
    }
    
        return (
            <>
            <h2>Request Access to the Vitality Project</h2>
            <p>The Vitality Project supports inclusion of sensitive datasets in our product catalogues. 
                Through Vitality, you may:</p>
                <ul>
                    <li>Create record entries for access to data in our catalogue.</li>
                    <li>Provide contact information for people who are interested in using your data.</li>
                    <li>Control what metadata entries are available in our catalogue through preset templates.</li>
                    <li>In consultation with Vitality, create custom templates, as necessary, 
                        to hide specific elements because they are sensitive.</li> 
                </ul>
                <div className='contactForm'>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <h2>Contact Us Via Email</h2> 
                  <div>
                  <TextField label="Name" variant="outlined" {...register("name")} />
                  </div>
                  <div>
                  <TextField label="Organization" variant="outlined" {...register("organization")}></TextField>
                  </div>
                  <div>
                  <Select labelId="purpose of contact"
                  id="purpose"
                  value={select}
                  label="Purpose of Contact"
                  {...register("purpose")}
                  onChange={handleChange}
                  >
                      <MenuItem value={1}>General Inquiries</MenuItem>
                      <MenuItem value={2}>Request Technical Support</MenuItem>
                      <MenuItem value={3}>Join the Vitality Project</MenuItem>
                  </Select>
                  </div>
                  <div>
                  <TextareaAutosize 
                  minRows={10}
                  placeholder="Enter your message here"
                  />
                  </div>
                  <ReCAPTCHA 
                    ref={recaptchaRef}
                    sitekey={sitekey} />
                  <button type="submit" >Submit Form</button>
                </form>
                </div>
            </>
        );
}

export default Request;