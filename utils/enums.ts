export enum ResponseMessageType {
  NOT_FOUND = "Record Not Found!",
  SERVER_ERROR = "Internal Server Error!"
}

export enum CognitoErrorType {
  INVALID_CODE = "CodeMismatchException",
  EXPIRED_CODE = "ExpiredCodeException",
  INVALID_PASSWORD = "InvalidPasswordException"
}

export enum ATNTCallType {
  MOBILE_ORIGINATING = "MO",
  MOBILE_TERMINATING = "MT",
  SERVICE_ORIGINATING = "SO",
  SERVICE_TERMINATING = "ST"
}

export enum ANTNFeatureType {
  ADD = "ADD",
  CBI = "CBI",
  CBIOP = "CBIOP",
  CBIP = "CBIP",
  CBIUK = "CBIUK",
  CBO = "CBO",
  CBOI = "CBOI",
  CBOIP = "CBOIP",
  CBOOP = "CBOOP",
  CBOUK = "CBOUK",
  CBUK = "CBUK",
  CFB = "CFB",
  CFC = "CFC",
  CFNA = "CFNA",
  CFNR = "CFNR",
  CFO = "CFO",
  CFU = "CFU",
  CFUK = "CFUK",
  CGC = "CGC",
  CGI = "CGI",
  CIAC = "CIAC",
  CICUG = "CICUG",
  CIPCI = "CIPCI",
  CMH = "CMH",
  CMPVM = "CMPVM",
  CMR = "CMR",
  CMRC = "CMRC",
  CMW = "CMW",
  ECT = "ECT",
  GREM = "GREM",
  INIOR = "INIOR",
  MPS = "MPS",
  NIND = "NIND",
  NIOP = "NIOP",
  MOR = "MOR",
  NITP = "NITP",
  NITR = "NITR",
  NSDA = "NSDA",
  OACR = "OACR",
  OEXT = "OEXT",
  OMCT = "OMCT",
  OMSC = "OMSC",
  OOR = "OOR",
  SUBCMH = "SUBCMH",
  V2G = "V2G",
  VM = "VM",
  VCORR = "VCORR",
  FCID = "FCID",
}