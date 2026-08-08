const request = require('supertest')
const { expect } = require('chai')

describe('Mutation - Criar Funcionário', () => {

    let token

    before(async () => {
        // Realiza login para obter o token de autenticação
        const respostaLogin = await request('http://localhost:4000')
            .post('/graphql')
            .send({
                query: `
                    mutation Login($email: String!, $senha: String!) {
                        login(email: $email, senha: $senha) {
                            token
                        }
                    }
                `,
                variables: {
                    email: 'admin@admin.com',
                    senha: '123456'
                }
            })

        expect(respostaLogin.status).to.equal(200)
        expect(respostaLogin.body).to.not.have.property('errors')

        token = respostaLogin.body.data.login.token

        expect(token).to.be.a('string')
        expect(token).to.not.be.empty
    })

    it('deve criar um funcionário quando preencher os campos obrigatórios de forma válida', async () => {

        // Gera um CPF diferente a cada execução
        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                    mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                        criarFuncionario(input: $input) {
                            id
                            cpf
                            nome
                            salario_base
                            admissao
                            desligamento
                        }
                    }
                `,
                variables: {
                    input: {
                        cpf: `${cpf}`,
                        nome: `Usuario Teste ${cpf}`,
                        salario_base: 2500,
                        admissao: '2026-06-30'
                    }
                }
            })

        expect(resposta.status).to.equal(200)

        // GraphQL pode retornar 200 mesmo quando há erro
        expect(resposta.body).to.not.have.property('errors')

        const funcionario = resposta.body.data.criarFuncionario

        expect(funcionario).to.have.property('id')

        expect(funcionario.cpf)
            .to.equal(cpf)

        expect(funcionario.nome)
            .to.equal(`Usuario Teste ${cpf}`)

        expect(funcionario.salario_base)
            .to.equal(2500)

        expect(funcionario.desligamento)
            .to.equal(null)
    })

    it('deve criar um funcionário quando preencher todos os campos de forma válida', async () => {

        // Gera um CPF diferente a cada execução
        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                    mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                        criarFuncionario(input: $input) {
                            id
                            cpf
                            nome
                            salario_base
                            admissao
                            desligamento
                        }
                    }
                `,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: 'Usuario Teste',
                        salario_base: 2500,
                        admissao: '2025-01-15',
                        desligamento: '2026-04-15'
                    }
                }
            })

        expect(resposta.status).to.equal(200)

        // GraphQL pode retornar 200 mesmo quando há erro
        expect(resposta.body).to.not.have.property('errors')

        const funcionario = resposta.body.data.criarFuncionario

        expect(funcionario).to.have.property('id')

        expect(funcionario.cpf)
            .to.equal(cpf)

        expect(funcionario.nome)
            .to.equal('Usuario Teste')

        expect(funcionario.salario_base)
            .to.equal(2500)

        expect(funcionario.admissao)
            .to.equal('2025-01-15')

        expect(funcionario.desligamento)
            .to.equal('2026-04-15')
    })

    it('não deve criar um funcionário quando passar o cpf em branco', async () => {

        // Gera um CPF diferente a cada execução
        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                    mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                        criarFuncionario(input: $input) {
                            id
                            cpf
                            nome
                            salario_base
                            admissao
                            desligamento
                        }
                    }
                `,
                variables: {
                    input: {
                        cpf: '',
                        nome: 'Usuario Teste',
                        salario_base: 2500,
                        admissao: '2026-06-30'
                    }
                }
            })

        expect(resposta.status).to.equal(200)
        expect(resposta.body.errors[0]).to.have.property('message', 'CPF, nome, salário base e admissão são obrigatórios.')
    })

    it('não deve criar um funcionário quando passar o cpf já cadastrado', async () => {

        // Gera um CPF diferente a cada execução
        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                    mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                        criarFuncionario(input: $input) {
                            id
                            cpf
                            nome
                            salario_base
                            admissao
                            desligamento
                        }
                    }
                `,
                variables: {
                    input: {
                        cpf: '012345678900',
                        nome: 'Usuario Teste',
                        salario_base: 2500,
                        admissao: '2026-06-30'
                    }
                }
            })

        expect(resposta.status).to.equal(200)
        expect(resposta.body.errors[0]).to.have.property('message', 'Já existe funcionário com este CPF.')
    })

    it('deve retornar erro quando o campo cpf não for informado', async () => {

        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }
            `,
                variables: {
                    input: {

                        nome: 'Usuario Teste',
                        salario_base: 3000,
                        admissao: '2026-04-15'
                        // admissao não informado propositalmente
                    }
                }
            })

        expect(resposta.status).to.equal(400)

        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include('Field "cpf" of required type "String!" was not provided.')
    })
    it('deve retornar erro quando o campo nome não for informado', async () => {

        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }
            `,
                variables: {
                    input: {
                        cpf: cpf,

                        salario_base: 3000,
                        admissao: '2026-04-15'

                    }
                }
            })

        expect(resposta.status).to.equal(400)

        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include('Field "nome" of required type "String!" was not provided.')
    })

    it('deve retornar erro quando o campo salario_base não for informado', async () => {

        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }
            `,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: 'Jeff Monteiro',
                        admissao: '2026-04-15'
                        // salario_base omitido propositalmente
                    }
                }
            })

        expect(resposta.status).to.equal(400)

        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include(
                'Field "salario_base" of required type "Float!" was not provided.'
            )
    })

    it('deve retornar erro quando o campo admissao não for informado', async () => {

        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }
            `,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: 'Usuario Teste',
                        salario_base: 3000,
                        desligamento: '2026-04-15'
                        // admissao não informado propositalmente
                    }
                }
            })

        expect(resposta.status).to.equal(400)

        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include('Field "admissao" of required type "String!" was not provided.')
    })

    it('admissão deve estar no formato YYYY-MM-DD e ser uma data válida.', async () => {

        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }
            `,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: 'Usuario Teste',
                        salario_base: 3000,
                        admissao: '01/01/2026' // Formato inválido propositalmente

                    }
                }
            })

        expect(resposta.status).to.equal(200)

        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include('Admissão deve estar no formato YYYY-MM-DD e ser uma data válida.')
    })

    it('desligamento não pode ser anterior à admissão.', async () => {

        const cpf = Date.now().toString().slice(-11)

        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: `
                mutation CriarFuncionario($input: CriarFuncionarioInput!) {
                    criarFuncionario(input: $input) {
                        id
                        cpf
                        nome
                        salario_base
                        admissao
                        desligamento
                    }
                }
            `,
                variables: {
                    input: {
                        cpf: cpf,
                        nome: 'Usuario Teste',
                        salario_base: 3000,
                        admissao: '2026-03-01',
                        desligamento: '2026-02-28' // Desligamento anterior à admissão propositalmente

                    }
                }
            })

        expect(resposta.status).to.equal(200)

        expect(resposta.body).to.have.property('errors')

        expect(resposta.body.errors[0].message)
            .to.include('Desligamento não pode ser anterior à admissão.')
    })

});