import { redirect } from "next/navigation";



const ProfilePage = () => {
    // true = loado, e false = deslogado
    // chamada para o banco, chamar usuario pelo id ou email
const user = true;

if(!user){
    redirect("/");
}
return (
    <div>
        <h1>BEM-VINDO AO SEU PERFIL!</h1>
    </div>
);
};
export default ProfilePage;

// talvez possa ser substituido pelo component shadsn de form