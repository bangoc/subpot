%SystemRoot%/system32/netsh advfirewall set allprofiles firewallpolicy blockinbound,blockoutbound

rem x64
%SystemRoot%/system32/netsh advfirewall firewall add rule name="Allow SubPot out" dir=out program= "C:\Program Files\SubPot\subpot.exe" remoteip=any protocol=any action=allow enable=yes