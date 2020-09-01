if ( (git status -s) -ne "" ) {
	$Confirm = Read-Host -Prompt "You have uncommited changes; they will not be turned in.`nProceed? (y/N)"
	if ( $Confirm -ne "y" ) {
		Write-Host "Aborted."
		exit 1
	}
}
git clone --bare . turnin.git
Compress-Archive -DestinationPath turnin.git.zip -Path turnin.git
Remove-Item -Recurse -Path turnin.git
