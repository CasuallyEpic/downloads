Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

' Paths
videosPath = shell.ExpandEnvironmentStrings("%USERPROFILE%\Videos\Screen Recordings")
screenshotsPath = shell.ExpandEnvironmentStrings("%USERPROFILE%\Pictures\Screenshots")

' Delete Screen Recordings folder completely
If fso.FolderExists(videosPath) Then
    fso.DeleteFolder videosPath, True
End If

' Recreate Screen Recordings folder
fso.CreateFolder videosPath

' Delete all files in Screenshots folder
If fso.FolderExists(screenshotsPath) Then
    Set folder = fso.GetFolder(screenshotsPath)
    For Each file In folder.Files
        file.Delete True
    Next
End If