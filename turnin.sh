#!/bin/sh

if [ -n "$(git status -s)" ]
then
	read -p $'You have uncommited changes; they will not be turned in.\nProceed? (y/N): ' confirm
	if [ "$confirm" != y ]
	then
		echo "Aborted." 1>&2
		exit 1
	fi
fi
git clone --bare . turnin.git
zip -r turnin.git.zip turnin.git
rm -rf turnin.git
echo "You can now turn in the “turnin.git.zip” file."
