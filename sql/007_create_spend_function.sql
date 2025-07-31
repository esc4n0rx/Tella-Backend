-- Função para gastar moedas de forma atômica
CREATE OR REPLACE FUNCTION spend_tella_coins(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_reference_id VARCHAR(255) DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_wallet tella_wallets%ROWTYPE;
    v_new_balance INTEGER;
    v_transaction_id UUID;
    v_result JSON;
BEGIN
    -- Buscar wallet com lock para evitar race conditions
    SELECT * INTO v_wallet
    FROM tella_wallets 
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- Verificar se wallet existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'wallet_not_found';
    END IF;
    
    -- Verificar saldo suficiente
    IF v_wallet.balance < p_amount THEN
        RAISE EXCEPTION 'insufficient_balance';
    END IF;
    
    -- Calcular novo saldo
    v_new_balance := v_wallet.balance - p_amount;
    
    -- Atualizar wallet
    UPDATE tella_wallets 
    SET 
        balance = v_new_balance,
        total_spent = total_spent + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Criar transação
    INSERT INTO tella_transactions (
        user_id,
        wallet_id,
        type,
        amount,
        balance_before,
        balance_after,
        description,
        reference_id,
        reference_type,
        ip_address
    ) VALUES (
        p_user_id,
        v_wallet.id,
        'spend',
        p_amount,
        v_wallet.balance,
        v_new_balance,
        p_description,
        p_reference_id,
        p_reference_type,
        p_ip_address
    ) RETURNING id INTO v_transaction_id;
    
    -- Retornar resultado
    v_result := json_build_object(
        'transaction_id', v_transaction_id,
        'balance_before', v_wallet.balance,
        'balance_after', v_new_balance,
        'amount_spent', p_amount
    );
    
    RETURN v_result;
END;
$$;