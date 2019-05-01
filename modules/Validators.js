module.exports = {
    validaContraseña : function(password1, password2) {
        if(password1 != password2){
            return true;
        }
        return false;

    }
};
