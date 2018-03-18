var config = {
    showQuery: false,   
    serverPort: 3000,
    bgprocPort: 8200,
    secret: "ExcuberApp",
    bucket: "excuber",
    //cauchbaseUrl: 'couchbase://10.10.10.11:8091',
    cauchbaseUrl: 'couchbase://localhost:8091',
    clientUrl: 'http://localhost:8000',
    ldapUrl: 'noauth',//'ldap://ucs-4430.excuber.intranet:389',
    folderNAS: '/mnt/excuber',
    rancher_timeoff: 120,
    rancher_api: 'http://rancher.excuber.intranet:80',
    rancher_acckey: 'C0479507F217C0D39E52',
    rancher_seckey: 'ozG8VmsNnpnWrxcWB2sfYabTskzajUBaqVkVAcJW',
    rancher_accid: '1a5'
}

if (process.env.SERVER_PORT)        config.serverPort       = process.env.SERVER_PORT;
if (process.env.BGPROC_PORT)        config.bgprocPort       = process.env.BGPROC_PORT;
if (process.env.BUCKET)             config.bucket           = process.env.BUCKET;
if (process.env.CAUCHBASE_URL)      config.cauchbaseUrl     = process.env.CAUCHBASE_URL;
if (process.env.CLIENT_URL)         config.clientUrl        = process.env.CLIENT_URL || 'http://10.10.10.11:8010';
if (process.env.LDAP_URL)           config.ldapUrl          = process.env.LDAP_URL;
if (process.env.NAS)                config.folderNAS        = process.env.NAS;
if (process.env.RANCHER_TIMEOFF)    config.rancher_timeoff  = process.env.RANCHER_TIMEOFF;
if (process.env.RANCHER_API)        config.rancher_api      = process.env.RANCHER_API;
if (process.env.RANCHER_KEY)        config.rancher_acckey   = process.env.RANCHER_KEY;
if (process.env.RANCHER_SECRET)     config.rancher_seckey   = process.env.RANCHER_SECRET;
if (process.env.ACCID)              config.rancher_accid    = process.env.ACCID;

module.exports = config;
