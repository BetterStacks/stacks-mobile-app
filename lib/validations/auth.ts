import * as Yup from "yup";

export const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email.")
    .required("Email address is required."),
  password: Yup.string().min(1).required("Password is required."),
});

export const SignUpSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email.")
    .required("Email address is required."),
  password: Yup.string().min(1).required("Password is required."),
  confirmedPassword: Yup.string().oneOf( // @ts-ignore
    [Yup.ref("password"), null],
    "Passwords must match.",
  ),
  fullName: Yup.string().min(1).required("Name is required."), 
});
