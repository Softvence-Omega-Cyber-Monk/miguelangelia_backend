

export type TUser = {
  role: "user" | "admin";
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string,
  organizationSize ?:string,
  address?: string,
  teamMemberNo?: number,
  yourRole?: string
  accountType : 'personal' | 'organizations',
  status : 'active' | "deactive" ,
  isSuspened : boolean
};
