## TCC

### Manual de uso (canvas)

#### Criando, apagando e movendo estados
- Apertar 's' cria um novo estado na posição atual do cursor do mouse. 
- Apertar 's' enquanto o cursor do mouse está sobre um estado já criado apaga tanto o estado quanto as transições que o tinham como origem ou destino. O mouse está sobre um estado quando a cor do estado se altera (de cinza para rosa).
- É possível alterar a posição atual de um determinado estado clicando com o botão esquerdo do mouse sobre ele e o arrastando enquanto mantém o botão pressionado.

#### Conectando estados
- Uma transição entre dois estatos pode ser criada apertando 't' sobre um estado já existente. Em seguida, move-se o mouse até outro estado, que será o estado destino da transição. Quando o mouse atingir o estado destino, é necessário apertar 't' mais uma vez para fixar a transição.
- Caso tenha-se criado uma transição por engano (foi criada mas ainda não foi fixada), pode-se cancelar o evento apertando 't' novamente enquanto o mouse não estiver sobre nenhum estado (nem mesmo sobre o estado de origem).
- Uma transição já fixada pode ser apagada ao apertar 't' enquanto o mouse está sobre uma transição. O mouse está sobre uma transição quando a cor da transição se altera (de cinza para rosa).

#### Atribuindo labels a estados ou transições

- Todo estado e transição já é criado com uma label padrão. No caso de estados é o seu ID e no caso de transições é um texto arbitrário. Essas labels podem ser editadas ao apertar 'w' sobre algum destes elementos. 
- Ao apertar 'w' com o mouse sobre um estado ou transição, o programa entra em modo de escrita, onde todas as teclas de controle são temporariamente desativadas. Deve-se digitar na caixa de texto que surge no topo esquerdo da página a nova label que se deseja atribuir ao elemento. Quando satisfeito, basta apertar no botão 'Submit' que o programa sai de modo de escrita e volta a interpretar determinados caracteres como comandos.
- Durante modo de escrita, pode-se verificar qual estado ou transição está sendo editado no momento através da cor alaranjada.